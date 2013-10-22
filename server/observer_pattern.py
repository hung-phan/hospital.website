#!usr/bin/python

"""Observer and observable implemetation"""

class Observable(object):

    """Observable"""
    def __init__(self):
        self.observers = list()
        self.changed = False

    def add_observer(self, observer):
        """Add new observer to observer's list"""
        self.observers.append(observer)

    def remove_observer(self, observer):
        """Remove old observer from observer's list"""
        if observer in self.observers:
            self.observers.remove(observer)

    def set_changed(self):
        """New thing has been changed"""
        self.changed = True

    def notify_observers(self, args=None):
        """Notify all observers"""
        if self.changed:
            for observer in self.observers:
                observer.update(args)
        self.changed = False

    def simple_notify(self, args=None):
        """Notify all observers"""
        for observer in self.observers:
            observer.update(args)
