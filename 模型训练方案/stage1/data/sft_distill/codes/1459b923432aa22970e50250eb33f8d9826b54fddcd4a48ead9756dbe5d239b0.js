class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 可验证的状态变量：idle, walk, run
    this.stateSpeed = { idle: 0, walk: 240, run: 480 };
  }

  preload() {
    // 程序化生成角色纹理
    this.createPlayerTextures();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player_idle');
    this.player.setCollideWorldBounds(true);

    // 创建状态文本显示
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作提示
    this.add.text(20, 60, '方向键移动 | 空格键切换状态', {
      fontSize: '16px',
      color: '#aaaaaa'
    });

    // 创建速度显示
    this.speedText = this.add.text(20, 540, '', {
      fontSize: '18px',
      color: '#00ff00'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键切换状态
    this.spaceKey.on('down', () => {
      this.switchState();
    });

    // 初始化状态显示
    this.updateStateDisplay();
  }

  createPlayerTextures() {
    // 创建静止状态纹理（蓝色）
    const idleGraphics = this.add.graphics();
    idleGraphics.fillStyle(0x3498db, 1);
    idleGraphics.fillCircle(25, 25, 25);
    idleGraphics.fillStyle(0xffffff, 1);
    idleGraphics.fillCircle(20, 20, 5); // 眼睛
    idleGraphics.fillCircle(30, 20, 5);
    idleGraphics.generateTexture('player_idle', 50, 50);
    idleGraphics.destroy();

    // 创建行走状态纹理（绿色）
    const walkGraphics = this.add.graphics();
    walkGraphics.fillStyle(0x2ecc71, 1);
    walkGraphics.fillCircle(25, 25, 25);
    walkGraphics.fillStyle(0xffffff, 1);
    walkGraphics.fillCircle(20, 20, 5);
    walkGraphics.fillCircle(30, 20, 5);
    walkGraphics.fillStyle(0x27ae60, 1);
    walkGraphics.fillRect(15, 35, 20, 5); // 腿部标识
    walkGraphics.generateTexture('player_walk', 50, 50);
    walkGraphics.destroy();

    // 创建跑步状态纹理（红色）
    const runGraphics = this.add.graphics();
    runGraphics.fillStyle(0xe74c3c, 1);
    runGraphics.fillCircle(25, 25, 25);
    runGraphics.fillStyle(0xffffff, 1);
    runGraphics.fillCircle(20, 20, 5);
    runGraphics.fillCircle(30, 20, 5);
    runGraphics.fillStyle(0xc0392b, 1);
    runGraphics.fillRect(10, 35, 30, 5); // 加长的腿部标识
    runGraphics.fillRect(20, 40, 10, 5); // 额外的动态标识
    runGraphics.generateTexture('player_run', 50, 50);
    runGraphics.destroy();
  }

  switchState() {
    // 状态循环切换：idle -> walk -> run -> idle
    if (this.currentState === 'idle') {
      this.currentState = 'walk';
    } else if (this.currentState === 'walk') {
      this.currentState = 'run';
    } else {
      this.currentState = 'idle';
    }

    // 更新纹理
    this.player.setTexture(`player_${this.currentState}`);

    // 更新显示
    this.updateStateDisplay();
  }

  updateStateDisplay() {
    const stateNames = {
      idle: '静止',
      walk: '行走',
      run: '跑步'
    };

    const speed = this.stateSpeed[this.currentState];

    this.stateText.setText(`当前状态: ${stateNames[this.currentState]}`);
    this.speedText.setText(`速度: ${speed} px/s`);

    // 根据状态改变文本颜色
    const colors = {
      idle: '#3498db',
      walk: '#2ecc71',
      run: '#e74c3c'
    };
    this.stateText.setColor(colors[this.currentState]);
  }

  update(time, delta) {
    // 获取当前状态的速度
    const speed = this.stateSpeed[this.currentState];

    // 重置速度
    this.player.setVelocity(0);

    // 只有在非静止状态下才能移动
    if (this.currentState !== 'idle') {
      // 方向键控制移动
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      }

      // 对角线移动时归一化速度
      if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
        this.player.body.velocity.normalize().scale(speed);
      }
    }

    // 实时显示当前实际速度（用于验证）
    const actualSpeed = Math.sqrt(
      this.player.body.velocity.x ** 2 + this.player.body.velocity.y ** 2
    ).toFixed(0);
    
    this.speedText.setText(
      `速度: ${this.stateSpeed[this.currentState]} px/s | 实际: ${actualSpeed} px/s`
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);