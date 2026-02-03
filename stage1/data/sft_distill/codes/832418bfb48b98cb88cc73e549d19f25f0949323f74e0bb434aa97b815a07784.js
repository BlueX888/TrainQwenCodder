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
  // 不需要预加载外部资源
}

function create() {
  // 方法1: 使用 Phaser.GameObjects.Star 创建星形
  const star = this.add.star(
    400,        // x 位置
    300,        // y 位置
    5,          // 星形的点数
    30,         // 内半径
    60,         // 外半径
    0x4169e1    // 蓝色填充
  );

  // 创建旋转动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    angle: 360,              // 旋转到 360 度
    duration: 2000,          // 持续时间 2 秒
    ease: 'Linear',          // 线性缓动，保持匀速旋转
    repeat: -1,              // -1 表示无限循环
    yoyo: false              // 不需要往返效果
  });

  // 添加文字说明
  this.add.text(400, 500, '蓝色星形旋转动画 (2秒/圈)', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);