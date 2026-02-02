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
  // 创建粉色椭圆
  // 使用 add.ellipse 方法创建椭圆对象
  const ellipse = this.add.ellipse(
    100,           // 起始 x 坐标（左侧）
    300,           // y 坐标（垂直居中）
    80,            // 宽度
    50,            // 高度
    0xff69b4       // 粉色填充
  );

  // 创建补间动画
  this.tweens.add({
    targets: ellipse,        // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 1000,          // 动画持续时间 1 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 往返效果（到达终点后反向播放）
    repeat: -1               // 无限循环（-1 表示永久重复）
  });

  // 添加提示文本
  this.add.text(400, 50, 'Pink Ellipse Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Looping: Left ↔ Right (1 second)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);