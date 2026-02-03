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
  // 使用 Graphics 创建粉色椭圆纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制椭圆（中心点在 50, 30，宽度 100，高度 60）
  graphics.fillEllipse(50, 30, 100, 60);
  
  // 生成纹理
  graphics.generateTexture('pinkEllipse', 100, 60);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'pinkEllipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（右侧）
    duration: 1000,             // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 启用往返（到达终点后反向播放）
    loop: -1                    // 无限循环（-1 表示永久循环）
  });
  
  // 添加说明文字
  this.add.text(400, 50, '粉色椭圆左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);