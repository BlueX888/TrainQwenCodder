class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.speed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('grayBox', 32, 32);
    graphics.destroy();

    // 创建 10 个灰色对象，随机分布
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'grayBox');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示移动次数（用于验证状态）
    this.moveText = this.add.text(10, 10, 'Moves: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示控制提示
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  update(time, delta) {
    let moved = false;
    const deltaSeconds = delta / 1000;
    const distance = this.speed * deltaSeconds;

    // 检测方向键并同步移动所有对象
    if (this.cursors.left.isDown) {
      this.objects.forEach(obj => {
        obj.x -= distance;
      });
      moved = true;
    }
    
    if (this.cursors.right.isDown) {
      this.objects.forEach(obj => {
        obj.x += distance;
      });
      moved = true;
    }
    
    if (this.cursors.up.isDown) {
      this.objects.forEach(obj => {
        obj.y -= distance;
      });
      moved = true;
    }
    
    if (this.cursors.down.isDown) {
      this.objects.forEach(obj => {
        obj.y += distance;
      });
      moved = true;
    }

    // 更新移动计数（每帧移动时计数加1）
    if (moved) {
      this.moveCount++;
      this.moveText.setText('Moves: ' + this.moveCount);
    }

    // 边界限制：防止对象完全移出画布
    this.objects.forEach(obj => {
      obj.x = Phaser.Math.Clamp(obj.x, 0, 800);
      obj.y = Phaser.Math.Clamp(obj.y, 0, 600);
    });
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