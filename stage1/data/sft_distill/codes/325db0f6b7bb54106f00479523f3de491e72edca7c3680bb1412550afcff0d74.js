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
  // 使用 Graphics 绘制灰色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理

  // 创建使用该纹理的精灵对象
  const circle = this.add.sprite(400, 300, 'circleTexture');

  // 创建闪烁动画（透明度从 1 到 0 再回到 1）
  this.tweens.add({
    targets: circle,
    alpha: 0, // 目标透明度
    duration: 1000, // 单程 1 秒
    yoyo: true, // 自动返回初始值
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑过渡
  });

  // 添加文字说明
  this.add.text(400, 500, '灰色圆形闪烁动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);