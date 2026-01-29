const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 场景尺寸
  const SCENE_WIDTH = 1600;
  const SCENE_HEIGHT = 1200;
  
  // 设置相机边界，限制相机只能在场景范围内移动
  this.cameras.main.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  
  // 绘制网格背景，方便观察相机移动
  const graphics = this.add.graphics();
  
  // 绘制网格线
  graphics.lineStyle(1, 0x444444, 1);
  const gridSize = 100;
  
  // 垂直线
  for (let x = 0; x <= SCENE_WIDTH; x += gridSize) {
    graphics.lineBetween(x, 0, x, SCENE_HEIGHT);
  }
  
  // 水平线
  for (let y = 0; y <= SCENE_HEIGHT; y += gridSize) {
    graphics.lineBetween(0, y, SCENE_WIDTH, y);
  }
  
  // 绘制场景边界（粗线）
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(2, 2, SCENE_WIDTH - 4, SCENE_HEIGHT - 4);
  
  // 在四个角落添加标记
  const cornerSize = 50;
  graphics.fillStyle(0x00ff00, 1);
  
  // 左上角
  graphics.fillCircle(cornerSize, cornerSize, 20);
  
  // 右上角
  graphics.fillCircle(SCENE_WIDTH - cornerSize, cornerSize, 20);
  
  // 左下角
  graphics.fillCircle(cornerSize, SCENE_HEIGHT - cornerSize, 20);
  
  // 右下角
  graphics.fillCircle(SCENE_WIDTH - cornerSize, SCENE_HEIGHT - cornerSize, 20);
  
  // 在中心添加一个标记
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(SCENE_WIDTH / 2, SCENE_HEIGHT / 2, 30);
  
  // 添加文本说明
  const style = {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  };
  
  this.add.text(10, 10, 'Scene: 1600x1200', style).setScrollFactor(0);
  this.add.text(10, 40, 'Camera Bounds: (0,0) to (1600,1200)', style).setScrollFactor(0);
  this.add.text(10, 70, 'Use Arrow Keys to Move Camera', style).setScrollFactor(0);
  
  // 显示相机位置的文本（动态更新）
  this.cameraInfoText = this.add.text(10, 100, '', style).setScrollFactor(0);
  
  // 添加键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 相机移动速度
  this.cameraSpeed = 5;
  
  // 将相机初始位置设置在场景中心
  this.cameras.main.scrollX = (SCENE_WIDTH - this.cameras.main.width) / 2;
  this.cameras.main.scrollY = (SCENE_HEIGHT - this.cameras.main.height) / 2;
}

function update() {
  const camera = this.cameras.main;
  
  // 使用方向键移动相机
  if (this.cursors.left.isDown) {
    camera.scrollX -= this.cameraSpeed;
  } else if (this.cursors.right.isDown) {
    camera.scrollX += this.cameraSpeed;
  }
  
  if (this.cursors.up.isDown) {
    camera.scrollY -= this.cameraSpeed;
  } else if (this.cursors.down.isDown) {
    camera.scrollY += this.cameraSpeed;
  }
  
  // 更新相机位置显示
  this.cameraInfoText.setText(
    `Camera: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})`
  );
  
  // 相机边界会自动限制 scrollX 和 scrollY 的值
  // 不会超出 setBounds 设置的范围
}

new Phaser.Game(config);