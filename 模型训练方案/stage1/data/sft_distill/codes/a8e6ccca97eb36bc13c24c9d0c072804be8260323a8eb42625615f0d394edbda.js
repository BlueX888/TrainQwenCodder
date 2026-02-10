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
  // 使用 Graphics 绘制青色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(50, 40, 100, 80); // 绘制椭圆（中心点，宽度，高度）
  
  // 生成纹理
  graphics.generateTexture('ellipseTexture', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用该纹理的 Sprite
  const ellipse = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 创建闪烁动画
  // 闪烁效果：透明度从 1 -> 0 -> 1，持续 2 秒，无限循环
  this.tweens.add({
    targets: ellipse,
    alpha: 0, // 目标透明度
    duration: 1000, // 1 秒变为透明
    yoyo: true, // 反向播放（0 -> 1）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Blinking Cyan Ellipse (2s cycle)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);