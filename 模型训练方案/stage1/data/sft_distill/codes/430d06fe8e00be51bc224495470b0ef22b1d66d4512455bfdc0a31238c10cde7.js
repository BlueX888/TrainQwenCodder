const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制星形（5个角的星星）
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const spikes = 5;
  
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius + outerRadius;
    const y = Math.sin(angle) * radius + outerRadius;
    starPoints.push(x, y);
  }
  
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  
  // 存储跟随速度
  this.followSpeed = 80;
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算平滑跟随
  // 使用线性插值，速度因子 = followSpeed * delta / 1000
  const smoothFactor = Math.min(1, (this.followSpeed * delta) / 1000);
  
  // 平滑移动到鼠标位置
  this.star.x = Phaser.Math.Linear(this.star.x, pointer.x, smoothFactor);
  this.star.y = Phaser.Math.Linear(this.star.y, pointer.y, smoothFactor);
}

new Phaser.Game(config);