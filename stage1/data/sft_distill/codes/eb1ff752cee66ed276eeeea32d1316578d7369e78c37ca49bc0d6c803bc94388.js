const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let star;
let graphics;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 设置世界边界，创建一个更大的游戏世界
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);

  // 创建 Graphics 对象绘制星形
  graphics = this.add.graphics();
  
  // 绘制一个黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(3, 0xffa500, 1);
  
  // 星形的中心点
  const centerX = 400;
  const centerY = 400;
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  // 绘制星形路径
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 将 graphics 对象作为跟随目标
  star = graphics;
  
  // 设置相机跟随星形
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（默认居中，这里显式设置为0,0表示居中）
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加提示文字（固定在相机视图中）
  const text = this.add.text(10, 10, '相机跟随星形移动\n星形自动向右上移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图中，不随世界移动
}

function update(time, delta) {
  // 星形向右上方移动
  // 向右移动（x 增加）
  star.x += 2;
  // 向上移动（y 减少）
  star.y -= 1.5;
  
  // 如果星形移动到世界边界外，重置位置
  if (star.x > 1900 || star.y < 100) {
    star.x = 400;
    star.y = 400;
  }
}

new Phaser.Game(config);