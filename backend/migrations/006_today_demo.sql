-- Demo Data for Today to populate Heatmap
INSERT OR IGNORE INTO routes (id, title, status, route_date) VALUES ('today_route_1', 'Morning Delivery', 'completed', date('now'));
INSERT OR IGNORE INTO routes (id, title, status, route_date) VALUES ('today_route_2', 'Afternoon Run', 'completed', date('now', '-1 day'));

-- Stop for Today
INSERT OR IGNORE INTO route_stops (id, route_id, location_id, status, stop_sequence) VALUES ('stop_today', 'today_route_1', 'loc_1', 'completed', 1);
INSERT OR IGNORE INTO route_stops (id, route_id, location_id, status, stop_sequence) VALUES ('stop_yesterday', 'today_route_2', 'loc_1', 'completed', 1);

-- Delivery for Today ($145.00)
INSERT OR IGNORE INTO deliveries (id, route_stop_id, payment, amount_cents) VALUES ('del_today', 'stop_today', 'cash', 14500);
INSERT OR IGNORE INTO deliveries (id, route_stop_id, payment, amount_cents) VALUES ('del_yesterday', 'stop_yesterday', 'cash', 28000);
