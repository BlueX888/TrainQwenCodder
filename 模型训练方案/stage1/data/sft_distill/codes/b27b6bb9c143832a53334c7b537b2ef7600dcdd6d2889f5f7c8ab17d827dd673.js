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
let speed = 100; // 每秒移动的像素

function preload() {
  // 使用 Graphics 创建六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制六边形
  const radius = 30;
  const sides = 6;
  
  graphics.fillStyle(0x00ff00, 1); // 绿色六边形
  graphics.lineStyle(3, 0xffffff, 1); // 白色边框
  
  graphics.beginPath();
  
  // 计算六边形的顶点
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    
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
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 创建一个更大的世界边界，让六边形可以向下移动很远
  const worldHeight = 3000;
  this.cameras.main.setBounds(0, 0, config.width, worldHeight);
  this.physics.world.setBounds(0, 0, config.width, worldHeight);
  
  // 在场景中心上方创建六边形
  hexagon = this.add.sprite(config.width / 2, 100, 'hexagon');
  
  // 设置相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 可选：设置跟随偏移，让六边形显示在屏幕上方1/3处而不是正中心
  // this.cameras.main.setFollowOffset(0, -100);
  
  // 添加一些参考网格线，方便观察移动效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制水平参考线
  for (let y = 0; y < worldHeight; y += 100) {
    graphics.lineTo(config.width, y);
    graphics.moveTo(0, y + 100);
  }
  
  graphics.strokePath();
  
  // 添加文字提示
  const text = this.add.text(10, 10, 'Camera following hexagon', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文字固定在相机上，不随场景移动
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 让六边形持续向下移动
  hexagon.y += speed * (delta / 1000);
  
  // 可选：当六边形到达世界底部时，重置到顶部
  if (hexagon.y > 2900) {
    hexagon.y = 100;
  }
  
  // 添加一些旋转效果，让运动更明显
  hexagon.rotation += 0.02;
}

const game = new Phaser.Game(config);