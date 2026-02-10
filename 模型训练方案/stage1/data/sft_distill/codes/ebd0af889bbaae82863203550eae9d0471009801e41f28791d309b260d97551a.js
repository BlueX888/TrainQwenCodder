class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
  }

  preload() {
    // 使用 Graphics 创建角色的不同姿态帧
    this.createCharacterFrames();
  }

  createCharacterFrames() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 创建 idle 状态的 4 帧（站立呼吸效果）
    for (let i = 0; i < 4; i++) {
      graphics.clear();
      
      // 身体（灰色矩形，高度略有变化模拟呼吸）
      const bodyHeight = 60 + Math.sin(i * Math.PI / 2) * 4;
      graphics.fillStyle(0x808080, 1);
      graphics.fillRect(16, 64 - bodyHeight, 32, bodyHeight);
      
      // 头部（深灰色圆形）
      graphics.fillStyle(0x606060, 1);
      graphics.fillCircle(32, 8, 12);
      
      // 眼睛（白色小点）
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28, 6, 2);
      graphics.fillCircle(36, 6, 2);
      
      graphics.generateTexture(`idle_${i}`, 64, 64);
    }
    
    // 创建 run 状态的 6 帧（跑步动作）
    for (let i = 0; i < 6; i++) {
      graphics.clear();
      
      // 身体（倾斜模拟跑步）
      const tilt = Math.sin(i * Math.PI / 3) * 10;
      graphics.fillStyle(0x808080, 1);
      graphics.save();
      graphics.translate(32, 32);
      graphics.rotate(tilt * Math.PI / 180);
      graphics.fillRect(-16, 0, 32, 50);
      graphics.restore();
      
      // 头部
      graphics.fillStyle(0x606060, 1);
      graphics.fillCircle(32 + tilt / 2, 8, 12);
      
      // 眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(28 + tilt / 2, 6, 2);
      graphics.fillCircle(36 + tilt / 2, 6, 2);
      
      // 腿部（简单的线条模拟跑步）
      graphics.lineStyle(4, 0x707070, 1);
      const legOffset = Math.sin(i * Math.PI / 3) * 15;
      graphics.lineBetween(32, 52, 32 - legOffset, 64);
      graphics.lineBetween(32, 52, 32 + legOffset, 64);
      
      graphics.generateTexture(`run_${i}`, 64, 64);
    }
    
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      state: 'idle',
      stateChanges: 0,
      lastChangeTime: 0,
      animationPlays: 0
    };

    // 创建角色精灵
    this.character = this.add.sprite(400, 300, 'idle_0');
    this.character.setScale(2);

    // 创建 idle 动画
    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_0' },
        { key: 'idle_1' },
        { key: 'idle_2' },
        { key: 'idle_3' },
        { key: 'idle_2' },
        { key: 'idle_1' }
      ],
      frameRate: 6,
      repeat: -1
    });

    // 创建 run 动画
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'run_0' },
        { key: 'run_1' },
        { key: 'run_2' },
        { key: 'run_3' },
        { key: 'run_4' },
        { key: 'run_5' }
      ],
      frameRate: 12,
      repeat: -1
    });

    // 播放初始 idle 动画
    this.character.play('idle');

    // 创建状态文本显示
    this.stateText = this.add.text(400, 50, 'State: IDLE', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.stateText.setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 550, 'Press I for IDLE | Press R for RUN', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 添加按键监听
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 监听按键事件
    this.keyI.on('down', () => this.switchState('idle'));
    this.keyR.on('down', () => this.switchState('run'));

    // 添加动画播放监听
    this.character.on('animationstart', (anim) => {
      window.__signals__.animationPlays++;
      console.log(JSON.stringify({
        event: 'animation_start',
        animation: anim.key,
        timestamp: Date.now()
      }));
    });
  }

  switchState(newState) {
    if (this.currentState === newState) {
      return; // 状态相同，不切换
    }

    const oldState = this.currentState;
    this.currentState = newState;

    // 更新信号
    window.__signals__.state = newState;
    window.__signals__.stateChanges++;
    window.__signals__.lastChangeTime = Date.now();

    // 输出日志
    console.log(JSON.stringify({
      event: 'state_change',
      from: oldState,
      to: newState,
      timestamp: window.__signals__.lastChangeTime,
      totalChanges: window.__signals__.stateChanges
    }));

    // 更新文本
    this.stateText.setText(`State: ${newState.toUpperCase()}`);

    // 停止当前所有 tween
    this.tweens.killTweensOf(this.character);

    // 播放对应动画
    this.character.play(newState);

    // 根据状态添加不同的 tween 效果
    if (newState === 'idle') {
      // idle 状态：缓慢的缩放呼吸效果
      this.tweens.add({
        targets: this.character,
        scaleX: 2.1,
        scaleY: 1.9,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 轻微的上下浮动
      this.tweens.add({
        targets: this.character,
        y: 295,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

    } else if (newState === 'run') {
      // run 状态：快速的左右移动
      this.tweens.add({
        targets: this.character,
        x: 600,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear'
      });

      // 跑步时的轻微跳跃
      this.tweens.add({
        targets: this.character,
        y: 285,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Quad.easeOut'
      });

      // 添加颜色闪烁效果（通过 alpha）
      this.tweens.add({
        targets: this.character,
        alpha: 0.85,
        duration: 150,
        yoyo: true,
        repeat: -1
      });
    }

    // 状态切换时的弹跳效果
    this.tweens.add({
      targets: this.character,
      scaleX: 2.3,
      scaleY: 2.3,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.character.setScale(2);
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
  scene: GameScene,
  pixelArt: true
};

new Phaser.Game(config);