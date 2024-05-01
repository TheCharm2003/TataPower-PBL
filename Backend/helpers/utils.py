import copy

import numpy as np


def is_outlier(value, p25, p75):
    """Check if value is an outlier"""
    lower = p25 - 1.5 * (p75 - p25)
    upper = p75 + 1.5 * (p75 - p25)
    return value <= lower or value >= upper


def get_indices_of_outliers(values):
    """Get outlier indices (if any)"""
    p25 = np.percentile(values, 25)
    p75 = np.percentile(values, 75)

    indices_of_outliers = []
    for ind, value in enumerate(values):
        if is_outlier(value, p25, p75):
            indices_of_outliers.append(ind)
    return indices_of_outliers


def getNewValue(dist, outliers_indices, index):
    previousIndex = index - 1
    nextIndex = index + 1
    if index == 0:
        previousIndex = 95
    if index == 95:
        nextIndex = 0

    while nextIndex in outliers_indices:
        if nextIndex == 95:
            nextIndex = 0
        else:
            nextIndex = nextIndex + 1

    while previousIndex in outliers_indices:
        if previousIndex == 0:
            previousIndex = 95
        else:
            previousIndex = previousIndex - 1

    return (dist[previousIndex] + dist[nextIndex]) / 2


def cleanOutliers(dist):
    dist = [float(val) for val in dist]
    indices_of_outliers = get_indices_of_outliers(dist)
    for i in copy.deepcopy(indices_of_outliers):
        newValue = getNewValue(dist, indices_of_outliers, i)
        dist[i] = newValue
        indices_of_outliers.remove(i)
    print("Removed Outliers")
    
    return dist
