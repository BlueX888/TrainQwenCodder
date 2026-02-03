const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let pointer;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF69B4, 1); // 粉色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 40;
  const innerRadius = 16;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + 50,
      y: Math.sin(angle) * radius + 50
    });
  }
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.sprite(400, 300, 'starTexture');
  star.setOrigin(0.5, 0.5);
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算平滑跟随
  // 速度80表示每秒移动80像素的速度因子
  const speed = 80;
  const factor = Math.min(1, (speed * delta) / 1000);
  
  // 使用线性插值实现平滑移动
  star.x = Phaser.Math.Linear(star.x, pointer.x, factor);
  star.y = Phaser.Math.Linear(star.y, pointer.y, factor);
}

new Phaser.Game(config);