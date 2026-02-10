const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push(radius * Math.cos(angle));
    starPoints.push(radius * Math.sin(angle));
  }
  
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右移动，4秒完成，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 4000, // 4秒
    yoyo: true, // 往返效果
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '橙色星形往返移动动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);