'use client';

import { useCallback, useRef, useState } from 'react';
import Map, { Source, Layer, Popup, MapRef } from 'react-map-gl/mapbox';
import type { GeoJSONSource, MapMouseEvent } from 'mapbox-gl';
import { Phone, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';
import { slugify } from '@/lib/utils';
import { fetchMapBusinesses } from '@/actions/fetch-map-businesses';
import type { MapBusinessData, MapBounds, RouteContext } from '@/lib/types';

interface BusinessMapProps {
  initialBusinesses: MapBusinessData[];
  center: { latitude: number; longitude: number };
  mapboxToken: string;
  basePath: string;
  ctx: RouteContext;
}

export function BusinessMap({
  initialBusinesses,
  center,
  mapboxToken,
  basePath,
  ctx,
}: BusinessMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [businesses, setBusinesses] =
    useState<MapBusinessData[]>(initialBusinesses);
  const [selectedBusiness, setSelectedBusiness] =
    useState<MapBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadedIdsRef = useRef<Set<string>>(
    new Set(initialBusinesses.map((b) => b.id))
  );
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Build URL for a business based on site context
  const buildBusinessUrl = useCallback(
    (business: MapBusinessData): string => {
      const singleCity = ctx.cityList.length === 1;
      const singleCategory = ctx.categoryList.length === 1;

      const parts = [basePath];

      const categorySlug = business.categorySlug || ctx.categoryList[0]?.slug;
      if (categorySlug && !singleCategory) {
        parts.push(categorySlug);
      }

      const citySlug = business.city
        ? slugify(business.city)
        : ctx.cityList[0]?.slug;
      if (citySlug && !singleCity) {
        parts.push(citySlug);
      }

      parts.push(business.id);

      return '/' + parts.join('/');
    },
    [basePath, ctx]
  );

  // Convert businesses to GeoJSON for clustering
  const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: businesses.map((business) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [business.longitude, business.latitude],
      },
      properties: {
        id: business.id,
        name: business.name,
        city: business.city,
        phone: business.phone,
        formatted_address: business.formatted_address,
        rating: business.rating,
        review_count: business.review_count,
        categorySlug: business.categorySlug,
      },
    })),
  };

  const fetchBusinessesInViewport = useCallback(async (bounds: MapBounds) => {
    setIsLoading(true);
    try {
      const excludeIds = Array.from(loadedIdsRef.current);
      const newBusinesses = await fetchMapBusinesses(bounds, excludeIds);

      if (newBusinesses.length > 0) {
        newBusinesses.forEach((b) => loadedIdsRef.current.add(b.id));
        setBusinesses((prev) => [...prev, ...newBusinesses]);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMoveEnd = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const mapBounds = map.getBounds();
      if (!mapBounds) return;

      const bounds: MapBounds = {
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      };

      fetchBusinessesInViewport(bounds);
    }, 300);
  }, [fetchBusinessesInViewport]);

  const handleClusterClick = useCallback((e: MapMouseEvent) => {
    const features = e.features;
    if (!features?.length) return;

    const feature = features[0];
    const clusterId = feature.properties?.cluster_id;

    const map = mapRef.current?.getMap();
    if (!map || !clusterId) return;

    const source = map.getSource('businesses') as GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      const geometry = feature.geometry as GeoJSON.Point;
      map.easeTo({
        center: geometry.coordinates as [number, number],
        zoom: zoom ?? 12,
      });
    });
  }, []);

  const handleMarkerClick = useCallback((e: MapMouseEvent) => {
    const features = e.features;
    if (!features?.length) return;

    const feature = features[0];
    const props = feature.properties;
    if (!props) return;

    const geometry = feature.geometry as GeoJSON.Point;
    const business: MapBusinessData = {
      id: props.id,
      name: props.name,
      city: props.city,
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
      phone: props.phone,
      formatted_address: props.formatted_address,
      rating: props.rating,
      review_count: props.review_count,
      categorySlug: props.categorySlug,
    };

    setSelectedBusiness(business);
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: 11,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMoveEnd={handleMoveEnd}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={(e) => {
          const features = e.features;
          if (!features?.length) {
            setSelectedBusiness(null);
            return;
          }

          const feature = features[0];
          if (feature.layer?.id === 'clusters') {
            handleClusterClick(e);
          } else if (feature.layer?.id === 'unclustered-point') {
            handleMarkerClick(e);
          }
        }}
      >
        <Source
          id="businesses"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#0284C7', // sky-600: small clusters
                10,
                '#D97706', // amber-600: medium clusters
                30,
                '#DC2626', // red-600: large clusters
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                25,
                30,
                30,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
            }}
          />

          {/* Individual markers */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': '#DC2626',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
            }}
          />
        </Source>

        {/* Popup for selected business */}
        {selectedBusiness && (
          <Popup
            longitude={selectedBusiness.longitude}
            latitude={selectedBusiness.latitude}
            anchor="bottom"
            onClose={() => setSelectedBusiness(null)}
            closeOnClick={false}
            className="[&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-close-button]:p-2 [&_.mapboxgl-popup-close-button]:text-lg"
          >
            <div className="p-3 min-w-[200px] max-w-[280px]">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                {selectedBusiness.name}
              </h3>

              {selectedBusiness.formatted_address && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {selectedBusiness.formatted_address}
                  </span>
                </div>
              )}

              {selectedBusiness.phone && (
                <a
                  href={`tel:${selectedBusiness.phone}`}
                  className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" />
                  {selectedBusiness.phone}
                </a>
              )}

              <Link
                href={buildBusinessUrl(selectedBusiness)}
                className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 px-3 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View Details
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </Popup>
        )}
      </Map>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
          Loading...
        </div>
      )}
    </div>
  );
}
