class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 状态验证变量
    this.stateChangeCount = 0; // 状态切换次数
  }

  preload() {
    // 生成 idle 状态的帧纹理（3帧，角色站立微动）
    for (let i = 0; i < 3; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      
      // 身体
      graphics.fillRect(16, 20 + i * 2, 32, 40);
      
      // 头部
      graphics.fillCircle(32, 15, 12);
      
      // 手臂（微微摆动）
      const armOffset = Math.sin(i * Math.PI / 2) * 3;
      graphics.fillRect(10, 30 + armOffset, 8, 20);
      graphics.fillRect(46, 30 - armOffset, 8, 20);
      
      // 腿部
      graphics.fillRect(20, 60, 10, 25);
      graphics.fillRect(34, 60, 10, 25);
      
      graphics.generateTexture(`idle_${i}`, 64, 90);
      graphics.destroy();
    }

    // 生成 run 状态的帧纹理（4帧，角色跑步动作）
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      
      // 身体（前倾）
      graphics.fillRect(18, 15, 28, 42);
      
      // 头部
      graphics.fillCircle(32, 12, 12);
      
      // 手臂（大幅摆动）
      const armAngle = i * Math.PI / 2;
      const armSwing = Math.sin(armAngle) * 10;
      graphics.fillRect(12, 25 + armSwing, 8, 22);
      graphics.fillRect(44, 25 - armSwing, 8, 22);
      
      // 腿部（跑步姿态）
      const legOffset = i % 2 === 0 ? 10 : -10;
      graphics.fillRect(20, 57 + legOffset, 10, 28);
      graphics.fillRect(34, 57 - legOffset, 10, 28);
      
      graphics.generateTexture(`run_${i}`, 64, 90);
      graphics.destroy();
    }
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建角色精灵
    this.player = this.add.sprite(400, 400, 'idle_0');
    this.player.setScale(2);

    // 创建 idle 动画
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' },
        { key: 'idle_2' },
        { key: 'idle_1' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // 创建 run 动画
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'run_0' },
        { key: 'run_1' },
        { key: 'run_2' },
        { key: 'run_3' }
      ],
      frameRate: 10,
      repeat: -1
    });

    // 默认播放 idle 动画
    this.player.play('idle');

    // 状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(20, 560, 'Press SPACE to toggle state | Arrow Keys to move (triggers run)', {
      fontSize: '16px',
      fill: '#aaaaaa'
    });

    // 键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 移动速度
    this.moveSpeed = 200;
    this.isMoving = false;

    // 更新状态显示
    this.updateStateDisplay();
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    this.isMoving = false;

    // 方向键移动（自动触发 run 状态）
    if (this.cursors.left.isDown) {
      this.player.x -= this.moveSpeed * deltaSeconds;
      this.player.flipX = true;
      this.isMoving = true;
      this.switchState('run');
    } else if (this.cursors.right.isDown) {
      this.player.x += this.moveSpeed * deltaSeconds;
      this.player.flipX = false;
      this.isMoving = true;
      this.switchState('run');
    } else if (this.cursors.up.isDown) {
      this.player.y -= this.moveSpeed * deltaSeconds;
      this.isMoving = true;
      this.switchState('run');
    } else if (this.cursors.down.isDown) {
      this.player.y += this.moveSpeed * deltaSeconds;
      this.isMoving = true;
      this.switchState('run');
    }

    // 停止移动时回到 idle
    if (!this.isMoving && this.currentState === 'run') {
      this.switchState('idle');
    }

    // 空格键手动切换状态
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.currentState === 'idle') {
        this.switchState('run');
      } else {
        this.switchState('idle');
      }
    }

    // 限制角色在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
    this.player.y = Phaser.Math.Clamp(this.player.y, 50, 550);
  }

  switchState(newState) {
    if (this.currentState === newState) return;

    const oldState = this.currentState;
    this.currentState = newState;
    this.stateChangeCount++;

    // 播放对应动画
    this.player.play(newState);

    // 添加状态切换的 tween 效果
    if (newState === 'run') {
      // 切换到 run：快速放大效果
      this.tweens.add({
        targets: this.player,
        scaleX: 2.2,
        scaleY: 2.2,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    } else {
      // 切换到 idle：缓慢呼吸效果
      this.tweens.add({
        targets: this.player,
        scaleX: 2.05,
        scaleY: 2.05,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 更新显示
    this.updateStateDisplay();

    console.log(`State changed: ${oldState} -> ${newState} (Count: ${this.stateChangeCount})`);
  }

  updateStateDisplay() {
    this.stateText.setText(
      `State: ${this.currentState.toUpperCase()}\n` +
      `Changes: ${this.stateChangeCount}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  pixelArt: true
};

new Phaser.Game(config);