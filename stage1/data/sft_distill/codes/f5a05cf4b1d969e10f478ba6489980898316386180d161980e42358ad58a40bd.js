class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveCount = 0; // 可验证的状态信号：记录移动次数
    this.speed = 120;
  }

  preload() {
    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(20, 20, 20); // 半径 20 的圆形
    graphics.generateTexture('yellowCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建 5 个黄色对象，分布在不同位置
    const positions = [
      { x: 150, y: 150 },
      { x: 400, y: 150 },
      { x: 650, y: 150 },
      { x: 275, y: 400 },
      { x: 525, y: 400 }
    ];

    positions.forEach(pos => {
      const obj = this.add.sprite(pos.x, pos.y, 'yellowCircle');
      this.objects.push(obj);
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示移动次数（用于验证状态）
    this.moveText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      color: '#cccccc'
    });

    // 记录上一帧的按键状态，用于检测新的按键
    this.lastKeyState = {
      left: false,
      right: false,
      up: false,
      down: false
    };
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    const movement = this.speed * deltaSeconds;
    let hasMoved = false;

    // 检测方向键并同步移动所有对象
    if (this.cursors.left.isDown) {
      this.objects.forEach(obj => {
        obj.x -= movement;
        // 边界检测
        if (obj.x < 20) obj.x = 20;
      });
      hasMoved = true;
    }

    if (this.cursors.right.isDown) {
      this.objects.forEach(obj => {
        obj.x += movement;
        // 边界检测
        if (obj.x > 780) obj.x = 780;
      });
      hasMoved = true;
    }

    if (this.cursors.up.isDown) {
      this.objects.forEach(obj => {
        obj.y -= movement;
        // 边界检测
        if (obj.y < 20) obj.y = 20;
      });
      hasMoved = true;
    }

    if (this.cursors.down.isDown) {
      this.objects.forEach(obj => {
        obj.y += movement;
        // 边界检测
        if (obj.y > 580) obj.y = 580;
      });
      hasMoved = true;
    }

    // 检测是否有新的按键按下（用于计数）
    const currentKeyState = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    };

    // 如果有任何按键从未按下变为按下状态，增加移动计数
    if (
      (!this.lastKeyState.left && currentKeyState.left) ||
      (!this.lastKeyState.right && currentKeyState.right) ||
      (!this.lastKeyState.up && currentKeyState.up) ||
      (!this.lastKeyState.down && currentKeyState.down)
    ) {
      this.moveCount++;
      this.moveText.setText('Move Count: ' + this.moveCount);
    }

    // 更新上一帧按键状态
    this.lastKeyState = currentKeyState;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);