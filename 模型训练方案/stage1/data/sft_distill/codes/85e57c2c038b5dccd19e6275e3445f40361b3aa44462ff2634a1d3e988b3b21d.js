const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建椭圆对象（使用 Ellipse GameObject）
  const ellipse = this.add.ellipse(
    400,        // x 位置（居中）
    300,        // y 位置（居中）
    200,        // 宽度
    120,        // 高度
    0x00ff88,   // 填充颜色（青绿色）
    1           // 透明度
  );

  // 添加描边使椭圆更明显
  ellipse.setStrokeStyle(3, 0xffffff);

  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,           // 动画目标
    scaleX: 0.24,              // X 轴缩放到 24%
    scaleY: 0.24,              // Y 轴缩放到 24%
    duration: 2000,            // 单程时长 2 秒
    yoyo: true,                // 启用往返效果（缩小后自动恢复）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'     // 缓动函数，使动画更平滑
  });

  // 添加提示文本
  this.add.text(400, 50, 'Ellipse Scale Animation (4s cycle)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Scale: 100% → 24% → 100% (Loop)', {
    fontSize: '18px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);