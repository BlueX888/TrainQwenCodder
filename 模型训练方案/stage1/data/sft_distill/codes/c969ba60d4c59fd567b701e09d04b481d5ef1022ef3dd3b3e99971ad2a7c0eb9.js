class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.gravityValue = 500;
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用 Graphics 创建玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    
    // 设置初始重力（向下）
    this.player.body.setGravityY(this.gravityValue);

    // 创建状态显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.switchCountText = this.add.text(16, 60, '', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加按键状态追踪（防止连续触发）
    this.upKeyPressed = false;
    this.downKeyPressed = false;

    // 创建地面和天花板参考线（用于视觉反馈）
    this.groundLine = this.add.graphics();
    this.groundLine.lineStyle(2, 0xff0000, 1);
    this.groundLine.lineBetween(0, height - 2, width, height - 2);

    this.ceilingLine = this.add.graphics();
    this.ceilingLine.lineStyle(2, 0x0000ff, 1);
    this.ceilingLine.lineBetween(0, 2, width, 2);

    // 更新显示
    this.updateGravityDisplay();
  }

  update(time, delta) {
    // 检测上方向键按下（切换重力向上）
    if (this.cursors.up.isDown && !this.upKeyPressed) {
      this.upKeyPressed = true;
      this.setGravityDirection('UP');
    } else if (this.cursors.up.isUp) {
      this.upKeyPressed = false;
    }

    // 检测下方向键按下（切换重力向下）
    if (this.cursors.down.isDown && !this.downKeyPressed) {
      this.downKeyPressed = true;
      this.setGravityDirection('DOWN');
    } else if (this.cursors.down.isUp) {
      this.downKeyPressed = false;
    }

    // 根据重力方向调整玩家旋转（视觉效果）
    if (this.gravityDirection === 'UP') {
      this.player.rotation = Phaser.Math.Linear(this.player.rotation, Math.PI, 0.1);
    } else {
      this.player.rotation = Phaser.Math.Linear(this.player.rotation, 0, 0.1);
    }

    // 更新显示
    this.updateGravityDisplay();
  }

  setGravityDirection(direction) {
    if (this.gravityDirection === direction) {
      return; // 方向未改变，不执行
    }

    this.gravityDirection = direction;
    this.switchCount++;

    if (direction === 'UP') {
      // 重力向上（负值）
      this.player.body.setGravityY(-this.gravityValue);
      this.ceilingLine.lineStyle(2, 0xff0000, 1); // 天花板变红（活跃）
      this.groundLine.lineStyle(2, 0x666666, 0.5); // 地面变灰（非活跃）
    } else {
      // 重力向下（正值）
      this.player.body.setGravityY(this.gravityValue);
      this.groundLine.lineStyle(2, 0xff0000, 1); // 地面变红（活跃）
      this.ceilingLine.lineStyle(2, 0x666666, 0.5); // 天花板变灰（非活跃）
    }

    // 重绘参考线
    const { width, height } = this.cameras.main;
    this.groundLine.clear();
    this.groundLine.lineBetween(0, height - 2, width, height - 2);
    
    this.ceilingLine.clear();
    this.ceilingLine.lineBetween(0, 2, width, 2);

    console.log(`Gravity switched to: ${direction}, Count: ${this.switchCount}`);
  }

  updateGravityDisplay() {
    const arrow = this.gravityDirection === 'UP' ? '↑' : '↓';
    const color = this.gravityDirection === 'UP' ? '#00ffff' : '#ff8800';
    
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection}`);
    this.gravityText.setColor(color);
    
    this.switchCountText.setText(`Switches: ${this.switchCount}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 世界重力设为0，通过玩家body控制
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);