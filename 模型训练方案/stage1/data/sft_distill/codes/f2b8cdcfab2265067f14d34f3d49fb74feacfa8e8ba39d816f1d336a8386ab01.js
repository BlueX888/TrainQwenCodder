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
  // 使用 Graphics 绘制蓝色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('blueCircle', 50, 50); // 生成 50x50 的纹理
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建使用蓝色圆形纹理的精灵
  const circle = this.add.sprite(100, 300, 'blueCircle');

  // 创建补间动画：从左到右移动，然后往返循环
  this.tweens.add({
    targets: circle,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（从 100 移动到 700）
    duration: 500,             // 动画持续时间 0.5 秒
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    repeat: -1,                // 无限循环（-1 表示永久重复）
    ease: 'Linear'             // 线性缓动函数，匀速移动
  });

  // 添加提示文本
  this.add.text(400, 50, 'Blue Circle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'The circle moves left-right in 0.5s loop', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);