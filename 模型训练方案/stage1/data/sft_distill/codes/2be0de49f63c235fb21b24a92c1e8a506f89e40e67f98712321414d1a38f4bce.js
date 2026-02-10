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
  // 创建绿色椭圆（使用 Ellipse 游戏对象）
  const ellipse = this.add.ellipse(
    400,        // x 位置（屏幕中心）
    300,        // y 位置（屏幕中心）
    200,        // 宽度
    120,        // 高度
    0x00ff00    // 绿色
  );

  // 创建闪烁动画
  // 使用 Tween 控制 alpha 属性实现闪烁效果
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    alpha: 0,                   // 目标透明度（完全透明）
    duration: 2000,             // 单次动画时长 2 秒
    ease: 'Sine.easeInOut',     // 缓动函数，使过渡更平滑
    yoyo: true,                 // 往返动画（淡出后再淡入）
    repeat: -1,                 // 无限循环
    repeatDelay: 0              // 重复间隔为 0
  });

  // 添加说明文字
  this.add.text(400, 50, '绿色椭圆闪烁动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '4秒完成一次完整闪烁循环', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);