class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 'up' or 'down'
    this.gravitySwitchCount = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化可验证信号
    window.__signals__ = {
      gravityDirection: 'down',
      gravitySwitchCount: 0,
      playerY: 0,
      timestamp: Date.now()
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建天花板纹理（红色）
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0xff0000, 1);
    ceilingGraphics.fillRect(0, 0, 800, 50);
    ceilingGraphics.generateTexture('ceiling', 800, 50);
    ceilingGraphics.destroy();

    // 创建地面（底部）
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setOrigin(0.5, 0.5);
    this.ground.refreshBody();

    // 创建天花板（顶部）
    this.ceiling = this.physics.add.staticSprite(400, 25, 'ceiling');
    this.ceiling.setOrigin(0.5, 0.5);
    this.ceiling.refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    
    // 初始重力向下
    this.player.body.setGravityY(400);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN (400)', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(16, 50, 'Press UP/DOWN to change gravity', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.switchCountText = this.add.text(16, 85, 'Switches: 0', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加键盘事件监听
    this.input.keyboard.on('keydown-UP', () => {
      this.setGravityUp();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.setGravityDown();
    });

    // 添加可视化重力方向指示器
    this.gravityIndicator = this.add.graphics();
    this.updateGravityIndicator();

    console.log('[INIT] Gravity game started. Use UP/DOWN keys to switch gravity direction.');
  }

  setGravityUp() {
    if (this.gravityDirection !== 'up') {
      this.gravityDirection = 'up';
      this.player.body.setGravityY(-400);
      this.gravitySwitchCount++;
      this.updateDisplay();
      this.updateSignals();
      console.log(`[GRAVITY_SWITCH] Direction: UP, Count: ${this.gravitySwitchCount}`);
    }
  }

  setGravityDown() {
    if (this.gravityDirection !== 'down') {
      this.gravityDirection = 'down';
      this.player.body.setGravityY(400);
      this.gravitySwitchCount++;
      this.updateDisplay();
      this.updateSignals();
      console.log(`[GRAVITY_SWITCH] Direction: DOWN, Count: ${this.gravitySwitchCount}`);
    }
  }

  updateDisplay() {
    const directionText = this.gravityDirection === 'up' ? 'UP (-400)' : 'DOWN (400)';
    this.gravityText.setText(`Gravity: ${directionText}`);
    this.switchCountText.setText(`Switches: ${this.gravitySwitchCount}`);
    this.updateGravityIndicator();
  }

  updateGravityIndicator() {
    this.gravityIndicator.clear();
    
    // 绘制箭头指示重力方向
    const arrowX = 750;
    const arrowY = 300;
    
    this.gravityIndicator.lineStyle(4, 0xffff00, 1);
    this.gravityIndicator.fillStyle(0xffff00, 1);
    
    if (this.gravityDirection === 'down') {
      // 向下箭头
      this.gravityIndicator.beginPath();
      this.gravityIndicator.moveTo(arrowX, arrowY - 30);
      this.gravityIndicator.lineTo(arrowX, arrowY + 20);
      this.gravityIndicator.strokePath();
      
      // 箭头头部
      this.gravityIndicator.fillTriangle(
        arrowX, arrowY + 30,
        arrowX - 10, arrowY + 15,
        arrowX + 10, arrowY + 15
      );
    } else {
      // 向上箭头
      this.gravityIndicator.beginPath();
      this.gravityIndicator.moveTo(arrowX, arrowY + 30);
      this.gravityIndicator.lineTo(arrowX, arrowY - 20);
      this.gravityIndicator.strokePath();
      
      // 箭头头部
      this.gravityIndicator.fillTriangle(
        arrowX, arrowY - 30,
        arrowX - 10, arrowY - 15,
        arrowX + 10, arrowY - 15
      );
    }
  }

  updateSignals() {
    window.__signals__ = {
      gravityDirection: this.gravityDirection,
      gravitySwitchCount: this.gravitySwitchCount,
      playerY: Math.round(this.player.y),
      playerVelocityY: Math.round(this.player.body.velocity.y),
      timestamp: Date.now()
    };
  }

  update(time, delta) {
    // 每帧更新信号（用于验证）
    if (time % 100 < delta) { // 大约每100ms更新一次
      this.updateSignals();
    }

    // 添加左右移动控制（可选，增强游戏性）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 世界重力设为0，通过玩家自身重力控制
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始信号
console.log('[GAME_START]', JSON.stringify({
  config: {
    width: config.width,
    height: config.height,
    gravityMagnitude: 400
  },
  initialState: {
    gravityDirection: 'down',
    gravitySwitchCount: 0
  }
}));