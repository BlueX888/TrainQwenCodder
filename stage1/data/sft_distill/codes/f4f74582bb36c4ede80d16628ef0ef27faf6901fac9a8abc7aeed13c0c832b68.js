const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  
  // 绘制星形：中心点(50, 50)，5个角，外半径50，内半径20
  graphics.fillStar(50, 50, 5, 50, 20);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建星形精灵，放置在屏幕中心
  this.star = this.add.sprite(400, 300, 'star');
  
  // 初始化旋转速度（度/秒）
  this.rotationSpeed = 120;
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 将 delta 转换为秒，然后乘以旋转速度
  const rotationIncrement = this.rotationSpeed * (delta / 1000);
  
  // 更新星形的角度
  this.star.angle += rotationIncrement;
}

new Phaser.Game(config);