class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 场景尺寸
    const WORLD_WIDTH = 1600;
    const WORLD_HEIGHT = 1200;

    // 设置场景背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 绘制网格背景以显示场景范围
    const graphics = this.add.graphics();
    
    // 绘制网格线
    graphics.lineStyle(1, 0x444444, 0.5);
    const gridSize = 100;
    
    // 垂直线
    for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
      graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    
    // 水平线
    for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
      graphics.lineBetween(0, y, WORLD_WIDTH, y);
    }

    // 绘制场景边界（红色边框）
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 在四个角落添加标记
    const cornerSize = 50;
    graphics.fillStyle(0xff0000, 0.8);
    graphics.fillCircle(0, 0, cornerSize); // 左上
    graphics.fillCircle(WORLD_WIDTH, 0, cornerSize); // 右上
    graphics.fillCircle(0, WORLD_HEIGHT, cornerSize); // 左下
    graphics.fillCircle(WORLD_WIDTH, WORLD_HEIGHT, cornerSize); // 右下

    // 在中心添加一个标记
    graphics.fillStyle(0x00ff00, 0.8);
    graphics.fillCircle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 60);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 40);

    // 添加坐标文本
    const style = { fontSize: '20px', fill: '#ffffff', backgroundColor: '#000000' };
    this.add.text(20, 20, 'Top-Left (0, 0)', style);
    this.add.text(WORLD_WIDTH - 220, 20, `Top-Right (${WORLD_WIDTH}, 0)`, style);
    this.add.text(20, WORLD_HEIGHT - 50, `Bottom-Left (0, ${WORLD_HEIGHT})`, style);
    this.add.text(WORLD_WIDTH - 320, WORLD_HEIGHT - 50, 
      `Bottom-Right (${WORLD_WIDTH}, ${WORLD_HEIGHT})`, style);
    this.add.text(WORLD_WIDTH / 2 - 80, WORLD_HEIGHT / 2 - 10, 'CENTER', style);

    // 设置相机边界 - 关键API
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加相机信息显示（固定在屏幕上）
    this.cameraInfo = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.cameraInfo.setScrollFactor(0); // 固定在屏幕上，不随相机移动

    // 添加操作提示
    this.add.text(10, 550, 'Use Arrow Keys to Move Camera', {
      fontSize: '18px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // 相机移动速度
    this.cameraSpeed = 5;
  }

  update(time, delta) {
    const camera = this.cameras.main;

    // 键盘控制相机移动
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

    // 更新相机位置信息
    this.cameraInfo.setText([
      `Camera Position: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})`,
      `Camera Bounds: 0-${camera.getBounds().width - camera.width} x 0-${camera.getBounds().height - camera.height}`,
      `World Size: ${camera.getBounds().width} x ${camera.getBounds().height}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  backgroundColor: '#000000'
};

new Phaser.Game(config);