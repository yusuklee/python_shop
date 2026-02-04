import enum

class OrderStatus(enum.Enum):
    ORDER_READY = "ORDER_READY"
    ORDER_COMPLETE = "ORDER_COMPLETE"
    ORDER_CANCELED = "ORDER_CANCELED"
