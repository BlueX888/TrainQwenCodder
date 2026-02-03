class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingTime = 3000; // 3秒录制时间
    this.actions = []; // 存储操作序列
    this.state = 'recording'; // recording, waiting, replaying
    this.replaySpeed = 1; // 回放速度倍数
    this.replayIndex = 0;
    this.startTime = 0;
    this.replayStartTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家角色（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.player.speed = 200;

    // 创建录制指示器（红点）
    const recordGraphics = this.add.graphics();
    recordGraphics.fillStyle(0xff0000, 1);
    recordGraphics.fillCircle(0, 0, 10);
    recordGraphics.generateTexture('recordIndicator', 20, 20);
    recordGraphics.destroy();

    this.recordIndicator = this.add.sprite(30, 30, 'recordIndicator');
    this.recordIndicator.visible = true;

    // 创建回放角色（半透明蓝色）
    const replayGraphics = this.add.graphics();
    replayGraphics.fillStyle(0x0088ff, 0.6);
    replayGraphics.fillCircle(0, 0, 20);
    replayGraphics.generateTexture('replayPlayer', 40, 40);
    replayGraphics.destroy();

    this.replayPlayer = this.add.sprite(400, 300, 'replayPlayer');
    this.replayPlayer.visible = false;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 速度调节键（1-5）
    this.speedKeys = {
      one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      five: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
    };

    // 监听鼠标左键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && this.state === 'waiting') {
        this.startReplay();
      }
    });

    // 创建UI文本
    this.stateText = this.add.text(70, 20, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(400, 50, '', {
      fontSize: '16px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5, 0);

    this.speedText = this.add.text(400, 550, '', {
      fontSize: '16px',
      fill: '#00ffff',
      align: 'center'
    }).setOrigin(0.5, 0);

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.state = 'recording';
    this.actions = [];
    this.startTime = this.time.now;
    this.recordIndicator.visible = true;
    this.player.setPosition(400, 300);
    this.replayPlayer.visible = false;

    this.updateUI();

    // 3秒后停止录制
    this.time.delayedCall(this.recordingTime, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.state = 'waiting';
    this.recordIndicator.visible = false;
    this.updateUI();
  }

  startReplay() {
    if (this.actions.length === 0) {
      this.infoText.setText('没有录制任何操作！');
      return;
    }

    this.state = 'replaying';
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    this.replayPlayer.setPosition(400, 300);
    this.replayPlayer.visible = true;
    this.player.setAlpha(0.3);
    this.updateUI();
  }

  recordAction(action, timestamp) {
    if (this.state === 'recording') {
      this.actions.push({
        action: action,
        timestamp: timestamp - this.startTime
      });
    }
  }

  updateUI() {
    const stateTexts = {
      recording: `录制中... ${Math.ceil((this.recordingTime - (this.time.now - this.startTime)) / 1000)}s`,
      waiting: '等待回放（点击鼠标左键）',
      replaying: `回放中... (${this.replaySpeed}x)`
    };

    this.stateText.setText(stateTexts[this.state] || '');

    if (this.state === 'recording') {
      this.infoText.setText('使用 WASD 或方向键移动');
      this.speedText.setText('');
    } else if (this.state === 'waiting') {
      this.infoText.setText(`已录制 ${this.actions.length} 个操作\n点击鼠标左键开始回放`);
      this.speedText.setText('按 1-5 调整回放速度');
    } else if (this.state === 'replaying') {
      this.infoText.setText('回放中...');
      this.speedText.setText(`回放速度: ${this.replaySpeed}x (按 1-5 调整)`);
    }
  }

  update(time, delta) {
    // 处理速度调节
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.one)) this.replaySpeed = 0.5;
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.two)) this.replaySpeed = 1;
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.three)) this.replaySpeed = 2;
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.four)) this.replaySpeed = 3;
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.five)) this.replaySpeed = 5;

    if (this.state === 'recording') {
      this.handlePlayerInput(delta);
      this.updateUI();
    } else if (this.state === 'replaying') {
      this.handleReplay();
      this.updateUI();
    }
  }

  handlePlayerInput(delta) {
    let velocityX = 0;
    let velocityY = 0;

    // 检测按键并记录操作
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -this.player.speed;
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
          Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
        this.recordAction('left_down', this.time.now);
      }
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = this.player.speed;
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
          Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
        this.recordAction('right_down', this.time.now);
      }
    }
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -this.player.speed;
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
          Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
        this.recordAction('up_down', this.time.now);
      }
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = this.player.speed;
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
          Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
        this.recordAction('down_down', this.time.now);
      }
    }

    // 记录按键释放
    if (Phaser.Input.Keyboard.JustUp(this.cursors.left) || 
        Phaser.Input.Keyboard.JustUp(this.wasd.left)) {
      this.recordAction('left_up', this.time.now);
    }
    if (Phaser.Input.Keyboard.JustUp(this.cursors.right) || 
        Phaser.Input.Keyboard.JustUp(this.wasd.right)) {
      this.recordAction('right_up', this.time.now);
    }
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) || 
        Phaser.Input.Keyboard.JustUp(this.wasd.up)) {
      this.recordAction('up_up', this.time.now);
    }
    if (Phaser.Input.Keyboard.JustUp(this.cursors.down) || 
        Phaser.Input.Keyboard.JustUp(this.wasd.down)) {
      this.recordAction('down_up', this.time.now);
    }

    // 移动玩家
    this.player.x += velocityX * delta / 1000;
    this.player.y += velocityY * delta / 1000;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);
  }

  handleReplay() {
    const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;
    
    // 模拟按键状态
    const activeKeys = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    // 应用所有已到时间的操作
    while (this.replayIndex < this.actions.length && 
           this.actions[this.replayIndex].timestamp <= elapsedTime) {
      const action = this.actions[this.replayIndex].action;
      this.replayIndex++;
    }

    // 检查当前应该按下哪些键
    for (let i = 0; i < this.replayIndex; i++) {
      const action = this.actions[i].action;
      if (action === 'left_down') activeKeys.left = true;
      if (action === 'left_up') activeKeys.left = false;
      if (action === 'right_down') activeKeys.right = true;
      if (action === 'right_up') activeKeys.right = false;
      if (action === 'up_down') activeKeys.up = true;
      if (action === 'up_up') activeKeys.up = false;
      if (action === 'down_down') activeKeys.down = true;
      if (action === 'down_up') activeKeys.down = false;
    }

    // 根据活动键移动回放角色
    let velocityX = 0;
    let velocityY = 0;

    if (activeKeys.left) velocityX = -this.player.speed;
    if (activeKeys.right) velocityX = this.player.speed;
    if (activeKeys.up) velocityY = -this.player.speed;
    if (activeKeys.down) velocityY = this.player.speed;

    this.replayPlayer.x += velocityX * this.game.loop.delta / 1000;
    this.replayPlayer.y += velocityY * this.game.loop.delta / 1000;

    // 边界限制
    this.replayPlayer.x = Phaser.Math.Clamp(this.replayPlayer.x, 20, 780);
    this.replayPlayer.y = Phaser.Math.Clamp(this.replayPlayer.y, 20, 580);

    // 检查回放是否结束
    if (this.replayIndex >= this.actions.length && 
        elapsedTime > this.actions[this.actions.length - 1].timestamp + 500) {
      this.endReplay();
    }
  }

  endReplay() {
    this.state = 'waiting';
    this.replayPlayer.visible = false;
    this.player.setAlpha(1);
    this.updateUI();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene
};

new Phaser.Game(config);