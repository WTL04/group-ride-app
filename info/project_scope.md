Draft v2 | October 23, 2026

## Goal

A mobile app for group bike rides. The leader starts a ride and sets the route, riders join, and everyone sees each other on a live map with an alert when someone falls behind. Location sharing exists only for the duration of the ride: it ends when the ride ends, expires automatically, and any rider can stop it at any time.

The second goal is personal: build a production-style system with real users to practice system design and infrastructure.

## Problem

Group rides lose people. Riders get dropped or lost, and today the workaround is a group chat with live location, which is not scoped to the ride and does not tell you who is behind. The app shows where everyone is relative to the route and alerts the group when someone drops off. It does not claim to know whether a rider is okay, and it is not an emergency service.

## Target user

A local recreational bike group. Pilot group and ride leader: to be named.

## V1 features

1. **Create a ride.** The leader sets a name and start time and uploads a route as a GPX file exported from a planner such as Komoot, Strava, or Ride with GPS.
2. **Join by link or QR.** Riders join with a link or QR code and a display name. Links expire, and the leader can remove a rider at any time.
3. **Live group map.** Every rider appears on the map. Each rider shows a last-seen state (for example, "last seen 4 min ago") so a stale position never looks live.
4. **Route-aware drop alert.** Progress is measured along the route, so the app can say a rider is a set distance behind the group or has left the route. The leader and the group are alerted.
5. **Ride end and expiry.** The leader ends the ride and sharing stops for everyone. Rides also auto-expire, and any rider can stop sharing at any time.
6. **Offline readiness.** The route and map area are downloaded to the phone before the ride. Location updates are buffered when there is no signal and sent when it returns.

## Out of scope for v1 (long-term goals)

- Ride discovery and request-to-join: a view of active rides in the local area, where people can ask the leader to join. It must only ever show that a ride exists with an approximate start area, never live locations to non-members, and reveal the exact start point only on approval.
- Group chat, or lighter preset ride messages.
- In-app route planning: tap-to-draw waypoints, then snap-to-trail routing.
- Ride stats and history.
- Accounts, moderation, and block and report tools. Request-to-join depends on them, so they ship together with discovery.

## Production practice goals

- Written SLOs, for example how fast a position update reaches other riders.
- Infrastructure as code, CI/CD with rollback, metrics and alerting.
- Backups with a tested restore.
- A synthetic load test, with results reported as synthetic.
- A postmortem for every incident.

## Milestones

1. **Walking skeleton.** One phone sends location to a backend and a second phone sees it on a map. Gate: three friends ride around a park for 30 minutes with screens locked, then review what was dropped or delayed.
2. **Core loop.** Everything in the v1 list above. Gate: one real ride with the pilot group.
3. **Production practice.** The goals listed above.

## Open decisions

- Whether link joins also get an optional leader-approval toggle. Accounts are deferred; if offered later, Apple requires an in-app way to delete one.
- Invite link expiry rules.
- Location history: recommended default is to delete it when the ride ends.
- Cross-platform framework choice and background location reliability on both platforms.
- Who the pilot group is, and one real story of a rider being dropped.



## Tech Stack
**Mobile**
- React Native with TypeScript, built as Expo development builds (not Expo Go) with EAS Build
- Background location: `expo-location` with TaskManager first (_decide_: switch to a commercial plugin if the park test shows dropped updates)
- Maps: MapLibre React Native with offline map packs (_proposed_); tile provider (_decide_, since the public OpenStreetMap tile servers are not meant for production traffic)
- Push notifications: Expo Notifications over APNs and FCM (_proposed_)
- On-device storage: SQLite for buffered location updates and downloaded routes (_proposed_)

**Backend**

- Fastapi 
- Real-time: WebSockets, with Redis pub/sub to fan out across server instances
- Ride-scoped guest tokens issued on join, since there are no accounts in v1 (_proposed_)

- unfamiliar:
	- ORM and migrations: pick one of Prisma or Drizzle (_decide_)
	- Shared Zod schemas for message types, in a monorepo with the app (_proposed_)

**Data**

- PostgreSQL for rides, memberships, and routes; RDS
- Redis with TTL for live positions and presence; ElastiCache

**Infrastructure (AWS)**

- Amazon EKS (paid) with a managed node group on EC2 instances
- Docker with multi-stage builds, Docker Compose for local development

- unfamilar:
	- Images in ECR, ALB for ingress, Route 53 and ACM for DNS and TLS (_proposed_)
	- Terraform or OpenTofu for infrastructure as code, GitHub Actions for CI/CD with rolling deploys and rollback (_proposed_)
	- Observability: Prometheus and Grafana or CloudWatch, plus OpenTelemetry and Sentry (_decide_)
	- Load testing: k6
