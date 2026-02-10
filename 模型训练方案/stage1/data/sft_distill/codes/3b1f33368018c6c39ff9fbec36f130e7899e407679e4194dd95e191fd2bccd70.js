class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 'up' or 'down'
    this.gravityValue = 600;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      gravityDirection: 'down',
      gravityValue: 600,
      playerY: 0,
      switchCount: 0
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x2ecc71, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建天花板纹理（灰色）
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x95a5a6, 1);
    ceilingGraphics.fillRect(0, 0, 800, 50);
    ceilingGraphics.generateTexture('ceiling', 800, 50);
    ceilingGraphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建地面（底部）
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    
    // 创建天花板（顶部）
    this.ceiling = this.physics.add.staticSprite(400, 25, 'ceiling');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 设置初始重力（向下）
    this.player.body.setGravityY(this.gravityValue);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示重力方向文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 添加提示文本
    this.add.text(16, 560, 'Press UP/DOWN arrows to switch gravity', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // 添加状态显示
    this.statusText = this.add.text(600, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // 记录上一帧按键状态，避免重复触发
    this.lastUpPressed = false;
    this.lastDownPressed = false;
  }

  update(time, delta) {
    // 检测向上键按下（切换到向上重力）
    if (this.cursors.up.isDown && !this.lastUpPressed) {
      if (this.gravityDirection !== 'up') {
        this.switchGravity('up');
      }
      this.lastUpPressed = true;
    } else if (!this.cursors.up.isDown) {
      this.lastUpPressed = false;
    }

    // 检测向下键按下（切换到向下重力）
    if (this.cursors.down.isDown && !this.lastDownPressed) {
      if (this.gravityDirection !== 'down') {
        this.switchGravity('down');
      }
      this.lastDownPressed = true;
    } else if (!this.cursors.down.isDown) {
      this.lastDownPressed = false;
    }

    // 更新信号状态
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.gravityDirection = this.gravityDirection;
    window.__signals__.gravityValue = this.gravityValue;

    // 更新状态文本
    this.statusText.setText(
      `Player Y: ${Math.round(this.player.y)}\n` +
      `Switches: ${window.__signals__.switchCount}`
    );
  }

  switchGravity(direction) {
    this.gravityDirection = direction;
    
    if (direction === 'up') {
      // 重力向上（负值）
      this.player.body.setGravityY(-this.gravityValue);
    } else {
      // 重力向下（正值）
      this.player.body.setGravityY(this.gravityValue);
    }

    // 更新显示文本
    this.updateGravityText();

    // 更新信号
    window.__signals__.gravityDirection = direction;
    window.__signals__.switchCount++;

    // 输出日志
    console.log(JSON.stringify({
      action: 'gravity_switch',
      direction: direction,
      gravityValue: direction === 'up' ? -this.gravityValue : this.gravityValue,
      timestamp: Date.now()
    }));
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'up' ? '↑' : '↓';
    const directionText = this.gravityDirection === 'up' ? 'UP' : 'DOWN';
    this.gravityText.setText(
      `Gravity: ${arrow} ${directionText} (${this.gravityValue})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#34495e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 全局重力设为0，通过精灵自身重力控制
      debug: false
    }
  },
  scene: GravityScene
};

const game = new Phaser.Game(config);