class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -300; // 跳跃力度
  }

  preload() {
    // 使用Graphics创建纹理，不需要外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.statusText.setText(`Jumps Available: ${this.maxJumps - this.jumpCount}`);
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(16, 16, `Jumps Available: ${this.maxJumps}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.add.text(16, 50, 'Press SPACE to jump (double jump enabled)', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 跳跃历史记录（用于验证）
    this.jumpHistory = [];
    this.historyText = this.add.text(16, 90, 'Jump History: []', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 左右移动控制
    this.add.text(16, 130, 'Arrow Keys: Move Left/Right', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount < this.maxJumps) {
        // 执行跳跃
        this.player.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
        
        // 记录跳跃信息
        const jumpType = this.jumpCount === 1 ? 'First Jump' : 'Double Jump';
        this.jumpHistory.push({
          type: jumpType,
          time: Math.floor(time / 1000),
          y: Math.floor(this.player.y)
        });
        
        // 只保留最近5次跳跃记录
        if (this.jumpHistory.length > 5) {
          this.jumpHistory.shift();
        }
        
        // 更新状态显示
        this.statusText.setText(`Jumps Available: ${this.maxJumps - this.jumpCount}`);
        
        // 更新跳跃历史显示
        const historyStr = this.jumpHistory.map(j => 
          `${j.type}@${j.time}s`
        ).join(', ');
        this.historyText.setText(`Jump History: [${historyStr}]`);
      }
    }

    // 检测是否在地面上（用于调试）
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.statusText.setText(`Jumps Available: ${this.maxJumps}`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);