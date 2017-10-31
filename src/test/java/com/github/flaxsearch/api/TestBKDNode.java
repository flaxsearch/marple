package com.github.flaxsearch.api;

import org.apache.lucene.util.NumericUtils;
import com.fasterxml.jackson.core.JsonGenerator;

import org.junit.BeforeClass;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Created by tom on 24/04/2017.
 */
public class TestBKDNode {
    private static BKDNode root;
    private static BKDNode c1;
    private static BKDNode c11;
    private static BKDNode c12;
    private static BKDNode c2;
    private static BKDNode c21;
    private static BKDNode c22;

    private static final int[] RVALS = {0, 10};
    private static final int[] C1VALS = {0, 5};
    private static final int[] C11VALS = {0, 3};
    private static final int[] C12VALS = {3, 5};
    private static final int[] C2VALS = {5, 10};
    private static final int[] C21VALS = {5, 7};
    private static final int[] C22VALS = {7, 10};

    public static BKDNode nodeFromInts(int[] vals) {
        byte[] bytes1 = new byte[4];
        NumericUtils.intToSortableBytes(vals[0], bytes1, 0);

        byte[] bytes2 = new byte[4];
        NumericUtils.intToSortableBytes(vals[1], bytes2, 0);

        return new BKDNode(bytes1, bytes2, 1, 4, null);
    }

    @BeforeClass
    public static void setup() {
        root = nodeFromInts(RVALS);
        c1 = nodeFromInts(C1VALS);
        c11 = nodeFromInts(C11VALS);
        c12 = nodeFromInts(C12VALS);
        c2 = nodeFromInts(C2VALS);
        c21 = nodeFromInts(C21VALS);
        c22 = nodeFromInts(C22VALS);

        c1.setParent(root);
        c11.setParent(c1);
        c12.setParent(c1);
        c2.setParent(root);
        c21.setParent(c2);
        c22.setParent(c2);
    }

    @Test
    public void testFindParentOf() {
        assertThat(c22.findParentOf(c21, 1, 4)).isEqualTo(c2);
        assertThat(c22.findParentOf(c11, 1, 4)).isEqualTo(root);
    }

    @Test
    public void testFindRoot() {
        assertThat(BKDNode.findRoot(c22)).isEqualTo(root);
    }

    @Test
    public void testContains() {
        assertThat(root.contains(c1, 1, 4)).isTrue();
        assertThat(root.contains(c11, 1, 4)).isTrue();
        assertThat(root.contains(c2, 1, 4)).isTrue();
        assertThat(root.contains(c22, 1, 4)).isTrue();
        assertThat(c2.contains(c22, 1, 4)).isTrue();
        assertThat(c2.contains(c12, 1, 4)).isFalse();
        assertThat(c11.contains(c1, 1, 4)).isFalse();
    }

}
