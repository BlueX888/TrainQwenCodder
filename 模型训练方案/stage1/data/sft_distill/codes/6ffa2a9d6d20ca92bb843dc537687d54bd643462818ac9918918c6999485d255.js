class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 可验证的状态信号
  }

  preload() {
    // 创建 idle 状态的帧纹理（3帧，略微变化的黄色矩形）
    for (let i = 0; i < 3; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFFD700, 1); // 黄色
      const height = 60 + i * 2; // 高度略微变化，模拟呼吸
      graphics.fillRect(0, 0, 40, height);
      graphics.generateTexture(`idle_frame_${i}`, 40, height);
      graphics.destroy();
    }

    // 创建 run 状态的帧纹理（4帧，倾斜的黄色矩形模拟跑步）
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFFD700, 1);
      
      // 绘制倾斜的矩形模拟跑步姿态
      const angle = (i % 2 === 0) ? -10 : 10;
      graphics.save();
      graphics.translate(20, 30);
      graphics.rotate(Phaser.Math.DegToRad(angle));
      graphics.fillRect(-20, -30, 40, 60);
      graphics.restore();
      
      graphics.generateTexture(`run_frame_${i}`, 50, 70);
      graphics.destroy();
    }
  }

  create() {
    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'idle_frame_0');
    this.player.setOrigin(0.5);

    // 创建 idle 动画（缓慢呼吸效果）
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_frame_0' },
        { key: 'idle_frame_1' },
        { key: 'idle_frame_2' },
        { key: 'idle_frame_1' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // 创建 run 动画（快速摆动）
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'run_frame_0' },
        { key: 'run_frame_1' },
        { key: 'run_frame_2' },
        { key: 'run_frame_3' }
      ],
      frameRate: 12,
      repeat: -1
    });

    // 默认播放 idle 动画
    this.player.play('idle');

    // 创建状态显示文本
    this.stateText = this.add.text(400, 100, 'State: IDLE', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.stateText.setOrigin(0.5);

    // 创建操作提示
    this.add.text(400, 550, 'Press I for IDLE | Press R for RUN', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听按键
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 按键事件
    this.keyI.on('down', () => {
      this.switchToIdle();
    });

    this.keyR.on('down', () => {
      this.switchToRun();
    });

    // 当前 tween 引用
    this.currentTween = null;
  }

  switchToIdle() {
    if (this.currentState === 'idle') return;
    
    this.currentState = 'idle';
    this.stateText.setText('State: IDLE');
    
    // 停止当前 tween
    if (this.currentTween) {
      this.currentTween.stop();
    }

    // 播放 idle 动画
    this.player.play('idle');

    // 添加 tween：回到中心位置，轻微上下浮动
    this.currentTween = this.tweens.add({
      targets: this.player,
      y: 300,
      x: 400,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // idle 状态的持续浮动效果
        this.currentTween = this.tweens.add({
          targets: this.player,
          y: '+=10',
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  switchToRun() {
    if (this.currentState === 'run') return;
    
    this.currentState = 'run';
    this.stateText.setText('State: RUN');
    
    // 停止当前 tween
    if (this.currentTween) {
      this.currentTween.stop();
    }

    // 播放 run 动画
    this.player.play('run');

    // 添加 tween：左右快速移动
    this.currentTween = this.tweens.add({
      targets: this.player,
      x: 600,
      y: 300,
      scaleX: 1.1,
      scaleY: 0.95,
      duration: 800,
      ease: 'Power1',
      onComplete: () => {
        // run 状态的持续左右移动
        this.currentTween = this.tweens.add({
          targets: this.player,
          x: 200,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Linear'
        });
      }
    });
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