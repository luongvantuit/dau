/* eslint-disable react-hooks/static-components --
 * Component của tailark, API đa hình qua prop `as`, nên component motion phải
 * được chọn lúc chạy. Lỗi thật mà quy tắc này nhắm tới (tạo lại component mỗi
 * render, làm mất state cây con) đã được vá bằng cache motionComponents ở mức
 * module bên dưới; quy tắc không lần được qua lời gọi hàm nên vẫn báo.
 */
'use client'
import React, { type ReactNode } from 'react'
import { motion, type Variants } from 'motion/react'

export type PresetType = 'fade' | 'slide' | 'scale' | 'blur' | 'blur-slide' | 'zoom' | 'flip' | 'bounce' | 'rotate' | 'swing'

export type AnimatedGroupProps = {
    children: ReactNode
    className?: string
    variants?: {
        container?: Variants
        item?: Variants
    }
    preset?: PresetType
    as?: React.ElementType
    asChild?: React.ElementType
}

const defaultContainerVariants: Variants = {
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const defaultItemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

const presetVariants: Record<PresetType, Variants> = {
    fade: {},
    slide: {
        hidden: { y: 20 },
        visible: { y: 0 },
    },
    scale: {
        hidden: { scale: 0.8 },
        visible: { scale: 1 },
    },
    blur: {
        hidden: { filter: 'blur(4px)' },
        visible: { filter: 'blur(0px)' },
    },
    'blur-slide': {
        hidden: { filter: 'blur(4px)', y: 20 },
        visible: { filter: 'blur(0px)', y: 0 },
    },
    zoom: {
        hidden: { scale: 0.5 },
        visible: {
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    },
    flip: {
        hidden: { rotateX: -90 },
        visible: {
            rotateX: 0,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    },
    bounce: {
        hidden: { y: -50 },
        visible: {
            y: 0,
            transition: { type: 'spring', stiffness: 400, damping: 10 },
        },
    },
    rotate: {
        hidden: { rotate: -180 },
        visible: {
            rotate: 0,
            transition: { type: 'spring', stiffness: 200, damping: 15 },
        },
    },
    swing: {
        hidden: { rotate: -10 },
        visible: {
            rotate: 0,
            transition: { type: 'spring', stiffness: 300, damping: 8 },
        },
    },
}

const addDefaultVariants = (variants: Variants) => ({
    hidden: { ...defaultItemVariants.hidden, ...variants.hidden },
    visible: { ...defaultItemVariants.visible, ...variants.visible },
})

// Cache ở mức module: gọi motion.create() trong thân render sẽ sinh component
// mới mỗi lần render, làm mất state cây con và huỷ animation đang chạy.
// (motion() cũ đã deprecated nên dùng motion.create().)
const motionComponents = new Map<React.ElementType, React.ElementType>()

function motionFor(tag: React.ElementType): React.ElementType {
    const cached = motionComponents.get(tag)
    if (cached) return cached
    const created = motion.create(tag as React.ElementType & string)
    motionComponents.set(tag, created)
    return created
}

function AnimatedGroup({ children, className, variants, preset, as = 'div', asChild = 'div' }: AnimatedGroupProps) {
    const selectedVariants = {
        item: addDefaultVariants(preset ? presetVariants[preset] : {}),
        container: addDefaultVariants(defaultContainerVariants),
    }
    const containerVariants = variants?.container || selectedVariants.container
    const itemVariants = variants?.item || selectedVariants.item

    const MotionComponent = motionFor(as)

    const MotionChild = motionFor(asChild)

    return (
        <MotionComponent
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={className}>
            {React.Children.map(children, (child, index) => (
                <MotionChild
                    key={index}
                    variants={itemVariants}>
                    {child}
                </MotionChild>
            ))}
        </MotionComponent>
    )
}

export { AnimatedGroup }
