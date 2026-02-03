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

let hexagon;
const moveSpeed = 2; // 每帧移动的像素数

function preload() {
  // 创建六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  const hexRadius = 30;
  const centerX = hexRadius + 5;
  const centerY = hexRadius + 5;
  
  // 绘制六边形的6个顶点
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', (hexRadius + 5) * 2, (hexRadius + 5) * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，初始位置在场景中心偏右上
  hexagon = this.add.sprite(600, 200, 'hexagon');
  
  // 设置相机边界为一个更大的区域，允许六边形移动
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 2000, 2000);
  
  // 让相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 添加提示文字（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随六边形\n六边形向左下移动', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  // 添加网格参考线，帮助观察移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 2000);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 2000; y += 100) {
    gridGraphics.lineBetween(0, y, 2000, y);
  }
}

function update(time, delta) {
  // 让六边形向左下移动
  // 左：x减小，下：y增大
  hexagon.x -= moveSpeed;
  hexagon.y += moveSpeed;
  
  // 可选：当六边形移出边界时重置位置
  if (hexagon.x < -50 || hexagon.y > 2050) {
    hexagon.setPosition(600, 200);
  }
  
  // 可选：添加旋转效果使移动更明显
  hexagon.rotation += 0.02;
}

new Phaser.Game(config);