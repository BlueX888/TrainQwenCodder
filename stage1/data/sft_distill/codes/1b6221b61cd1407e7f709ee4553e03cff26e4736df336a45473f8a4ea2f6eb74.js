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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -60);      // 顶点
  graphics.lineTo(-52, 30);     // 左下角
  graphics.lineTo(52, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('triangle', 104, 90);
  
  // 销毁 Graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置初始透明度为 0（完全透明）
  triangle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 4000,              // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 反向播放（不透明回到透明）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 500, '三角形透明度循环动画（4秒周期）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);