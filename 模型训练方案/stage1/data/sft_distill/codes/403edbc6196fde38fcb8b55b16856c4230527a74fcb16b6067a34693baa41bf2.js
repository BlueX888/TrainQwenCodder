const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建椭圆对象（使用 Ellipse GameObject）
  const ellipse = this.add.ellipse(
    400,        // x 位置（屏幕中心）
    300,        // y 位置（屏幕中心）
    200,        // 宽度
    120,        // 高度
    0x00ff88,   // 填充颜色（青绿色）
    1           // 透明度
  );

  // 添加描边使椭圆更明显
  ellipse.setStrokeStyle(4, 0xffffff, 1);

  // 创建缩放补间动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    scaleX: 0.64,              // X轴缩放到64%
    scaleY: 0.64,              // Y轴缩放到64%
    duration: 2500,            // 单程持续时间2.5秒
    yoyo: true,                // 启用往返效果（缩放后会自动恢复）
    loop: -1,                  // 无限循环（-1表示永久循环）
    ease: 'Sine.easeInOut'     // 使用正弦缓动函数使动画更平滑
  });

  // 添加文本说明
  this.add.text(400, 50, 'Ellipse Scale Animation', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Scaling to 64% and back in 2.5s (looping)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);