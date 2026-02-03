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

let diamond; // 菱形精灵对象
const MOVE_SPEED = 2; // 移动速度

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形（四个顶点）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在场景中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置相机跟随菱形
  // 参数：目标对象, 是否圆滑跟随(可选), lerpX(可选), lerpY(可选)
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 可选：设置相机边界，创建更大的世界空间
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 添加提示文本（固定在相机视图中）
  const instructionText = this.add.text(10, 10, '相机跟随菱形移动', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 添加坐标显示文本
  this.coordText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
}

function update(time, delta) {
  // 让菱形持续向右下移动
  diamond.x += MOVE_SPEED;
  diamond.y += MOVE_SPEED;
  
  // 更新坐标显示
  this.coordText.setText(`菱形位置: (${Math.floor(diamond.x)}, ${Math.floor(diamond.y)})`);
  
  // 可选：添加旋转效果使移动更明显
  diamond.rotation += 0.01;
}

// 创建游戏实例
new Phaser.Game(config);