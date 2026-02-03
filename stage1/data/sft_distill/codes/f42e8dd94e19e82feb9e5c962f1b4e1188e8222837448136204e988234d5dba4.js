class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 验证信号：当前状态
    this.stateChangeCount = 0; // 验证信号：状态切换次数
  }

  preload() {
    // 创建橙色角色的 idle 状态纹理（2帧）
    this.createIdleFrames();
    // 创建橙色角色的 run 状态纹理（2帧）
    this.createRunFrames();
  }

  createIdleFrames() {
    // Idle 帧1：正常站立
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0xff8800, 1); // 橙色
    graphics1.fillRect(0, 0, 60, 80); // 身体
    graphics1.fillStyle(0xff6600, 1); // 深橙色
    graphics1.fillCircle(30, 20, 18); // 头部
    graphics1.fillRect(10, 30, 15, 8); // 左臂
    graphics1.fillRect(35, 30, 15, 8); // 右臂
    graphics1.generateTexture('idle_frame1', 60, 80);
    graphics1.destroy();

    // Idle 帧2：轻微变化（手臂稍微抬起）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff8800, 1);
    graphics2.fillRect(0, 0, 60, 80);
    graphics2.fillStyle(0xff6600, 1);
    graphics2.fillCircle(30, 20, 18);
    graphics2.fillRect(10, 28, 15, 8); // 左臂稍微抬起
    graphics2.fillRect(35, 28, 15, 8); // 右臂稍微抬起
    graphics2.generateTexture('idle_frame2', 60, 80);
    graphics2.destroy();
  }

  createRunFrames() {
    // Run 帧1：跑步姿势1（左腿前）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0xff8800, 1);
    graphics1.fillRect(0, 0, 60, 80);
    graphics1.fillStyle(0xff6600, 1);
    graphics1.fillCircle(30, 20, 18);
    // 手臂前后摆动
    graphics1.fillRect(5, 25, 15, 8); // 左臂向前
    graphics1.fillRect(40, 35, 15, 8); // 右臂向后
    // 腿部
    graphics1.fillRect(15, 60, 12, 20); // 左腿前
    graphics1.fillRect(33, 65, 12, 15); // 右腿后
    graphics1.generateTexture('run_frame1', 60, 80);
    graphics1.destroy();

    // Run 帧2：跑步姿势2（右腿前）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff8800, 1);
    graphics2.fillRect(0, 0, 60, 80);
    graphics2.fillStyle(0xff6600, 1);
    graphics2.fillCircle(30, 20, 18);
    // 手臂前后摆动（相反）
    graphics2.fillRect(40, 25, 15, 8); // 右臂向前
    graphics2.fillRect(5, 35, 15, 8); // 左臂向后
    // 腿部
    graphics2.fillRect(33, 60, 12, 20); // 右腿前
    graphics2.fillRect(15, 65, 12, 15); // 左腿后
    graphics2.generateTexture('run_frame2', 60, 80);
    graphics2.destroy();
  }

  create() {
    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'idle_frame1');
    this.player.setScale(1.5);

    // 创建 idle 动画
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_frame1' },
        { key: 'idle_frame2' }
      ],
      frameRate: 2, // 慢速播放
      repeat: -1
    });

    // 创建 run 动画
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'run_frame1' },
        { key: 'run_frame2' }
      ],
      frameRate: 8, // 快速播放
      repeat: -1
    });

    // 播放初始 idle 动画
    this.player.play('idle');

    // 创建 idle 状态的 tween（上下浮动）
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: 280,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      paused: false
    });

    // 创建 run 状态的 tween（左右移动）
    this.runTween = this.tweens.add({
      targets: this.player,
      x: 600,
      duration: 1000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
      paused: true
    });

    // 添加状态文本显示
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStateText();

    // 添加提示文本
    this.add.text(20, 60, 'Press SPACE to toggle state\nPress R to switch to Run\nPress I to switch to Idle', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加统计文本
    this.statsText = this.add.text(20, 550, '', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatsText();

    // 监听按键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

    // 按键事件监听
    this.spaceKey.on('down', () => {
      this.toggleState();
    });

    this.rKey.on('down', () => {
      this.switchToRun();
    });

    this.iKey.on('down', () => {
      this.switchToIdle();
    });
  }

  toggleState() {
    if (this.currentState === 'idle') {
      this.switchToRun();
    } else {
      this.switchToIdle();
    }
  }

  switchToRun() {
    if (this.currentState === 'run') return;
    
    this.currentState = 'run';
    this.stateChangeCount++;
    
    // 切换动画
    this.player.play('run');
    
    // 停止 idle tween，启动 run tween
    this.idleTween.pause();
    this.player.y = 300; // 重置 y 位置
    this.runTween.resume();
    
    this.updateStateText();
    this.updateStatsText();
  }

  switchToIdle() {
    if (this.currentState === 'idle') return;
    
    this.currentState = 'idle';
    this.stateChangeCount++;
    
    // 切换动画
    this.player.play('idle');
    
    // 停止 run tween，启动 idle tween
    this.runTween.pause();
    this.player.x = 400; // 重置 x 位置
    this.idleTween.resume();
    
    this.updateStateText();
    this.updateStatsText();
  }

  updateStateText() {
    this.stateText.setText(`Current State: ${this.currentState.toUpperCase()}`);
    
    // 根据状态改变文本颜色
    if (this.currentState === 'idle') {
      this.stateText.setStyle({ fill: '#00ff00' });
    } else {
      this.stateText.setStyle({ fill: '#ff0000' });
    }
  }

  updateStatsText() {
    this.statsText.setText(`State Changes: ${this.stateChangeCount}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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