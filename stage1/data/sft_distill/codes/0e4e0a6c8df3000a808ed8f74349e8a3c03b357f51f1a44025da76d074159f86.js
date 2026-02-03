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
  // 使用 Graphics 绘制粉色椭圆
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
  
  // 绘制椭圆 (x, y, width, height)
  graphics.fillEllipse(100, 75, 200, 150);
  
  // 生成纹理
  graphics.generateTexture('pinkEllipse', 200, 150);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用纹理的精灵，放置在屏幕中央
  const ellipseSprite = this.add.sprite(400, 300, 'pinkEllipse');
  
  // 创建闪烁动画
  this.tweens.add({
    targets: ellipseSprite,           // 动画目标对象
    alpha: 0,                         // 目标透明度（从当前 1 变为 0）
    duration: 1250,                   // 单程时长 1.25 秒
    yoyo: true,                       // 启用往返效果（0 -> 1）
    repeat: -1,                       // 无限循环 (-1 表示永久重复)
    ease: 'Sine.easeInOut'           // 缓动函数，使闪烁更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, '粉色椭圆闪烁动画 (2.5秒循环)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);