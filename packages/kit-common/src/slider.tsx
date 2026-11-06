import { useRef } from 'react';
import { Label, Slider as AriaSlider, SliderOutput, SliderThumb, SliderTrack, Text } from 'react-aria-components';
import { cx } from './cx.js';
import { useReason, warnNoReason } from './reason.js';

export interface SliderProps {
  /** Its name, shown above it. */
  label: string;
  /** One quiet line under the label: what moving it changes. */
  hint?: string;
  value?: number;
  defaultValue?: number;
  /** As it moves. */
  onChange?: (value: number) => void;
  /** Once it's let go: save here. */
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** How the value is written beside the label: "60%", "3 of 5". Plain numbers by default. */
  format?: (value: number) => string;
  /**
   * Draw it as a row of steps, one small well for each, and each one up to the value comes up as a key.
   * For a few settings only (up to about 10): the range divided by `step`.
   */
  steps?: boolean;
  disabled?: boolean;
  /** Why it can't be moved, in one sentence. With one, it stays focusable and says so. */
  reason?: string;
  className?: string;
}

/**
 * A level or a share chosen by feel. By default a fader: the track is a narrow well, the part you've
 * chosen fills in ink, and the thumb is a small key standing in it, its depth a thicker bottom line.
 * With `steps`, a short row of wells instead, each up to the value raised as a key, and one press on any
 * sets it. The value is written in mono beside the label. Dragging, arrow keys, Page Up and Down and
 * Home and End come from React Aria.
 */
export function Slider({ label, hint, value, defaultValue, onChange, onChangeEnd, min = 0, max = 100, step = 1, format = String, steps, disabled, reason, className }: SliderProps) {
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const key = useRef({});
  warnNoReason(key.current, `Slider "${label}"`, disabled, reason);
  const count = Math.max(1, Math.round((max - min) / step));
  return (
    <AriaSlider
      className={cx('augur-slider augur-control relative', className)}
      data-look={steps ? 'steps' : 'fader'}
      data-unavailable={disabled || undefined}
      value={reasoned ? (value ?? defaultValue ?? min) : value}
      defaultValue={defaultValue ?? min}
      onChange={(v) => !reasoned && onChange?.(v as number)}
      onChangeEnd={(v) => !reasoned && onChangeEnd?.(v as number)}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled && !reasoned}
    >
      <div className="augur-slider-head">
        <Label className="augur-field-label">{label}</Label>
        <SliderOutput className="augur-slider-value">{({ state }) => format(state.getThumbValue(0))}</SliderOutput>
      </div>
      {hint ? (
        <Text slot="description" className="augur-hint">
          {hint}
        </Text>
      ) : null}
      <SliderTrack className="augur-slider-track">
        {({ state }) => {
          const share = state.getThumbPercent(0);
          return (
            <>
              {steps ? (
                <span className="augur-slider-steps" aria-hidden="true">
                  {Array.from({ length: count }, (_, i) => (
                    <span key={i} className="augur-slider-step" data-on={i < Math.round(share * count) || undefined} />
                  ))}
                </span>
              ) : (
                <span className="augur-slider-fill" style={{ width: `${share * 100}%` }} aria-hidden="true" />
              )}
              <SliderThumb className="augur-slider-thumb" aria-describedby={describe['aria-describedby']} />
            </>
          );
        }}
      </SliderTrack>
      {caption}
    </AriaSlider>
  );
}
