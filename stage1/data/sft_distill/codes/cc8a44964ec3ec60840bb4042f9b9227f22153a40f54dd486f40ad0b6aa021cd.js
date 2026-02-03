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
  // 不需要加载外部资源
}

function create() {
  // 创建青色椭圆
  const ellipse = this.add.ellipse(
    400,           // x 位置（屏幕中心）
    200,           // y 位置（起始位置）
    100,           // 宽度
    60,            // 高度
    0x00ffff       // 青色
  );

  // 创建弹跳动画
  // 使用 yoyo 模式实现上下弹跳
  this.tweens.add({
    targets: ellipse,
    y: 500,                    // 目标 y 位置（底部）
    duration: 1000,            // 单程持续时间 1 秒
    ease: 'Bounce.easeOut',    // 弹跳缓动效果
    yoyo: true,                // 启用往返模式
    repeat: -1,                // 无限循环
    hold: 0,                   // 到达目标后不停留
    repeatDelay: 0             // 重复之间无延迟
  });

  // 添加文字说明
  this.add.text(400, 50, '弹跳的青色椭圆', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 580, '2秒完成一次完整弹跳循环', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建并启动游戏
new Phaser.Game(config);