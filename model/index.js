const Orders = require('./orders');
const DriversDetails = require('./driversDetails');
const CustomerProfile = require('./customerProfile');
const Products = require('./products');
const OrderItems = require('./orderItems');
const User = require('./user');
const Delivery = require('./delivery');
const Procurement = require('./procurement');
const Vendor = require('./vendor');

// Orders ↔ CustomerProfile
Orders.belongsTo(CustomerProfile, {
  foreignKey: 'customer_id',
});
CustomerProfile.hasMany(Orders, {
  foreignKey: 'customer_id',
});

// Orders ↔ DriversDetails (alias changed to 'order_driver')
Orders.belongsTo(DriversDetails, {
  foreignKey: 'driver_id',
  targetKey: 'did',
  as: 'order_driver',          // unique alias here
});
DriversDetails.hasMany(Orders, {
  foreignKey: 'driver_id',
  sourceKey: 'did',
  as: 'orders',                // alias for inverse relation
});

// Orders ↔ OrderItems
Orders.hasMany(OrderItems, { foreignKey: 'order_id' });
OrderItems.belongsTo(Orders, { foreignKey: 'order_id' });

// Products ↔ OrderItems
Products.hasMany(OrderItems, { foreignKey: 'product_id' });
OrderItems.belongsTo(Products, { foreignKey: 'product_id' });

// User ↔ CustomerProfile (via email)
User.hasOne(CustomerProfile, {
  foreignKey: 'contact_person_email',
  sourceKey: 'email',
});
CustomerProfile.belongsTo(User, {
  foreignKey: 'contact_person_email',
  targetKey: 'email',
});

// DriversDetails ↔ Delivery (alias changed to 'delivery_driver')
DriversDetails.hasMany(Delivery, {
  foreignKey: 'driver_id',
  sourceKey: 'did',
  as: 'deliveries',             // alias for inverse relation
});
Delivery.belongsTo(DriversDetails, {
  foreignKey: 'driver_id',
  targetKey: 'did',
  as: 'delivery_driver',        // unique alias here
});

// Vendor ↔ Procurement
Vendor.hasMany(Procurement, {
  foreignKey: 'vendor_id',
  as: 'procurements',
});
Procurement.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor',
});

Delivery.belongsTo(Orders, {
  foreignKey: 'order_id',
  as: 'order'
});

// Procurement.belongsTo(Procurement,{
//   foreignKey: 'procurement_id',
//   as: 'procurement'
// })

// Procurement.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
// Procurement.belongsTo(DriversDetails, { foreignKey: 'driver_id', as: 'driver' });

// Delivery.belongsTo(DriversDetails, {
//   foreignKey: 'driver_id',
//   as: 'driver'
// });

module.exports = {
  Orders,
  CustomerProfile,
  DriversDetails,
  Products,
  OrderItems,
  User,
  Delivery,
   Vendor,
  Procurement,
};
