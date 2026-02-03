class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
    this.isFlashing = false; // 防止重复触发
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 添加一些可视化元素
    const circle = this.add.graphics();
    circle.fillStyle(0x00ff00, 1);
    circle.fillCircle(400, 300, 50);

    const rect = this.add.graphics();
    rect.fillStyle(0xff0000, 1);
    rect.fillRect(200, 150, 100, 80);

    const triangle = this.add.graphics();
    triangle.fillStyle(0x0000ff, 1);
    triangle.fillTriangle(600, 200, 550, 300, 650, 300);

    // 添加提示文字
    this.add.text(400, 50, 'Press Arrow Keys to Flash Camera', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 550, 'Flash Count: 0', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加当前状态提示
    this.stateText = this.add.text(400, 500, 'Ready', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录按键上一帧的状态，用于检测按下事件
    this.lastKeyStates = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update(time, delta) {
    // 检测方向键是否刚被按下（从未按下到按下的状态变化）
    const upPressed = this.cursors.up.isDown && !this.lastKeyStates.up;
    const downPressed = this.cursors.down.isDown && !this.lastKeyStates.down;
    const leftPressed = this.cursors.left.isDown && !this.lastKeyStates.left;
    const rightPressed = this.cursors.right.isDown && !this.lastKeyStates.right;

    // 更新按键状态
    this.lastKeyStates.up = this.cursors.up.isDown;
    this.lastKeyStates.down = this.cursors.down.isDown;
    this.lastKeyStates.left = this.cursors.left.isDown;
    this.lastKeyStates.right = this.cursors.right.isDown;

    // 如果任意方向键被按下且当前没有闪烁效果在进行
    if ((upPressed || downPressed || leftPressed || rightPressed) && !this.isFlashing) {
      this.triggerFlash();
    }
  }

  triggerFlash() {
    // 设置闪烁状态
    this.isFlashing = true;
    this.flashCount++;

    // 更新状态文字
    this.statusText.setText(`Flash Count: ${this.flashCount}`);
    this.stateText.setText('Flashing...').setColor('#ff0000');

    // 触发相机闪烁效果
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制, 回调函数
    this.cameras.main.flash(3000, 255, 255, 255, false, (camera, progress) => {
      // 闪烁完成后的回调
      if (progress === 1) {
        this.isFlashing = false;
        this.stateText.setText('Ready').setColor('#00ff00');
        console.log(`Flash completed. Total flashes: ${this.flashCount}`);
      }
    });

    console.log(`Flash triggered! Count: ${this.flashCount}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);