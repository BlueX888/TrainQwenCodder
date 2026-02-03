// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -240;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      jumpCount: 0,
      isGrounded: true,
      totalJumps: 0,
      events: []
    };

    // 创建地面
    this.ground = this.physics.add.staticGroup();
    const groundSprite = this.ground.create(400, 580, 'ground');
    groundSprite.setScale(20, 1).refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 落地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.jumpCount = 0;
        window.__signals__.isGrounded = true;
        this.logEvent('landed');
      }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update() {
    // 水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
        window.__signals__.jumpCount = this.jumpCount;
        window.__signals__.totalJumps++;
        window.__signals__.isGrounded = false;
        
        this.logEvent('jump', {
          jumpNumber: this.jumpCount,
          position: { x: this.player.x, y: this.player.y }
        });
        
        this.updateStatusText();
      }
    }

    // 更新接地状态
    if (this.player.body.touching.down && !window.__signals__.isGrounded) {
      window.__signals__.isGrounded = true;
    }

    this.updateStatusText();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 40, 40);
    groundGraphics.generateTexture('ground', 40, 40);
    groundGraphics.destroy();
  }

  updateStatusText() {
    const isGrounded = this.player.body.touching.down;
    const status = `跳跃次数: ${this.jumpCount}/${this.maxJumps}\n` +
                   `总跳跃: ${window.__signals__.totalJumps}\n` +
                   `状态: ${isGrounded ? '着地' : '空中'}\n` +
                   `可跳跃: ${this.jumpCount < this.maxJumps ? '是' : '否'}\n` +
                   `提示: 按空格键跳跃`;
    this.statusText.setText(status);
  }

  logEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      jumpCount: this.jumpCount,
      ...data
    };
    window.__signals__.events.push(event);
    console.log(JSON.stringify(event));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证函数
window.getGameSignals = () => {
  return JSON.stringify(window.__signals__, null, 2);
};

// 输出初始状态
console.log('Game initialized. Use arrow keys to move, SPACE to jump (max 2 jumps)');
console.log('Call window.getGameSignals() to see current state');