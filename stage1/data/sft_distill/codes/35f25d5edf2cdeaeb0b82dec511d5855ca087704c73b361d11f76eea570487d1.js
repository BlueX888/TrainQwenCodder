class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态常量
    this.STATE = {
      IDLE: 'idle',
      WALK: 'walk',
      RUN: 'run'
    };
    // 可验证的状态变量
    this.currentState = this.STATE.IDLE;
    this.speed = 0;
    this.stateChangeCount = 0; // 状态切换次数
  }

  preload() {
    // 使用 Graphics 创建三种状态的纹理
    this.createPlayerTextures();
  }

  createPlayerTextures() {
    // 静止状态 - 蓝色
    const idleGraphics = this.add.graphics();
    idleGraphics.fillStyle(0x3498db, 1);
    idleGraphics.fillRect(0, 0, 40, 60);
    idleGraphics.fillStyle(0xffffff, 1);
    idleGraphics.fillCircle(20, 15, 5); // 眼睛
    idleGraphics.generateTexture('player_idle', 40, 60);
    idleGraphics.destroy();

    // 行走状态 - 绿色
    const walkGraphics = this.add.graphics();
    walkGraphics.fillStyle(0x2ecc71, 1);
    walkGraphics.fillRect(0, 0, 40, 60);
    walkGraphics.fillStyle(0xffffff, 1);
    walkGraphics.fillCircle(20, 15, 5);
    walkGraphics.fillStyle(0x27ae60, 1);
    walkGraphics.fillRect(5, 50, 10, 10); // 腿部标记
    walkGraphics.fillRect(25, 50, 10, 10);
    walkGraphics.generateTexture('player_walk', 40, 60);
    walkGraphics.destroy();

    // 跑步状态 - 红色
    const runGraphics = this.add.graphics();
    runGraphics.fillStyle(0xe74c3c, 1);
    runGraphics.fillRect(0, 0, 40, 60);
    runGraphics.fillStyle(0xffffff, 1);
    runGraphics.fillCircle(20, 15, 5);
    runGraphics.fillStyle(0xc0392b, 1);
    runGraphics.fillRect(0, 50, 15, 10); // 跑步姿态
    runGraphics.fillRect(25, 50, 15, 10);
    runGraphics.generateTexture('player_run', 40, 60);
    runGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player_idle');
    this.player.setOrigin(0.5);

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建速度显示文本
    this.speedText = this.add.text(20, 60, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建统计信息文本
    this.statsText = this.add.text(20, 100, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作提示
    this.add.text(20, 550, '按键: 1-静止 | 2-行走 | 3-跑步 | 方向键-移动', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 键盘事件监听
    this.key1.on('down', () => this.changeState(this.STATE.IDLE));
    this.key2.on('down', () => this.changeState(this.STATE.WALK));
    this.key3.on('down', () => this.changeState(this.STATE.RUN));

    // 初始化状态
    this.updateStateDisplay();
  }

  changeState(newState) {
    if (this.currentState === newState) return;

    this.currentState = newState;
    this.stateChangeCount++;

    // 更新速度
    switch (newState) {
      case this.STATE.IDLE:
        this.speed = 0;
        this.player.setTexture('player_idle');
        break;
      case this.STATE.WALK:
        this.speed = 200;
        this.player.setTexture('player_walk');
        break;
      case this.STATE.RUN:
        this.speed = 400; // 200 * 2
        this.player.setTexture('player_run');
        break;
    }

    this.updateStateDisplay();
  }

  updateStateDisplay() {
    // 更新状态文本
    const stateNames = {
      [this.STATE.IDLE]: '静止',
      [this.STATE.WALK]: '行走',
      [this.STATE.RUN]: '跑步'
    };
    this.stateText.setText(`当前状态: ${stateNames[this.currentState]}`);

    // 更新速度文本
    this.speedText.setText(`速度: ${this.speed} px/s`);

    // 更新统计信息
    this.statsText.setText(`状态切换次数: ${this.stateChangeCount}`);
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    const moveDistance = this.speed * deltaSeconds;

    // 根据方向键移动角色
    let moved = false;
    if (this.cursors.left.isDown) {
      this.player.x -= moveDistance;
      this.player.setFlipX(true);
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.x += moveDistance;
      this.player.setFlipX(false);
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= moveDistance;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.y += moveDistance;
      moved = true;
    }

    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 30, 570);

    // 如果在静止状态下尝试移动，给予视觉反馈
    if (this.currentState === this.STATE.IDLE && moved) {
      // 静止状态下轻微抖动效果
      this.player.setTint(0xffcccc);
      this.time.delayedCall(100, () => {
        this.player.clearTint();
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: GameScene,
  pixelArt: false
};

new Phaser.Game(config);