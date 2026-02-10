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

let diamond;
const MOVE_SPEED = 100; // 每秒移动像素

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（中心点在 32, 32）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在场景中心偏右上
  diamond = this.add.sprite(600, 200, 'diamond');
  
  // 设置相机跟随菱形
  this.cameras.main.startFollow(diamond);
  
  // 可选：设置相机边界，让相机可以自由移动
  // 这里设置一个较大的世界边界
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加提示文字（固定在相机视图中）
  const text = this.add.text(10, 10, '相机跟随菱形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 添加坐标显示
  this.coordsText = this.add.text(10, 50, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordsText.setScrollFactor(0);
}

function update(time, delta) {
  // 计算移动距离（基于时间的移动，确保不同帧率下速度一致）
  const moveDistance = MOVE_SPEED * (delta / 1000);
  
  // 向左下移动（x 减少，y 增加）
  // 使用 45 度角移动，所以 x 和 y 的变化量相同
  const offset = moveDistance * Math.sqrt(2) / 2;
  
  diamond.x -= offset;
  diamond.y += offset;
  
  // 更新坐标显示
  this.coordsText.setText(
    `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})`
  );
  
  // 可选：添加旋转效果，让菱形在移动时旋转
  diamond.rotation += 0.02;
}

// 启动游戏
new Phaser.Game(config);