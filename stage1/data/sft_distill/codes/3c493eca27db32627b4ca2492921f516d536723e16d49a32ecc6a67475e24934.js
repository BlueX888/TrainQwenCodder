class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle';
    
    // 初始化信号对象
    window.__signals__ = {
      state: 'idle',
      stateChangeCount: 0,
      timestamp: Date.now()
    };
  }

  preload() {
    // 创建灰色角色的 idle 帧纹理
    this.createIdleFrames();
    // 创建灰色角色的 run 帧纹理
    this.createRunFrames();
  }

  createIdleFrames() {
    // 创建 3 帧 idle 动画（呼吸效果）
    for (let i = 0; i < 3; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1); // 灰色
      
      // 根据帧数调整大小，模拟呼吸
      const scale = 1 + i * 0.05;
      const width = 40 * scale;
      const height = 60 * scale;
      const offsetX = (50 - width) / 2;
      const offsetY = (70 - height) / 2;
      
      // 绘制身体
      graphics.fillRect(offsetX, offsetY, width, height);
      
      // 绘制头部
      graphics.fillCircle(25, offsetY - 10, 15 * scale);
      
      // 生成纹理
      graphics.generateTexture(`idle_${i}`, 50, 70);
      graphics.destroy();
    }
  }

  createRunFrames() {
    // 创建 4 帧 run 动画（跑步效果）
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1); // 灰色
      
      // 身体倾斜角度
      const leanAngle = Math.sin(i * Math.PI / 2) * 10;
      
      // 绘制倾斜的身体
      graphics.save();
      graphics.translateCanvas(25, 35);
      graphics.rotateCanvas(leanAngle * Math.PI / 180);
      graphics.fillRect(-20, -30, 40, 60);
      graphics.restore();
      
      // 绘制头部
      graphics.fillCircle(25, 5, 15);
      
      // 绘制腿部（交替位置）
      const legOffset = i % 2 === 0 ? 5 : -5;
      graphics.fillRect(15 + legOffset, 55, 8, 15);
      graphics.fillRect(27 - legOffset, 55, 8, 15);
      
      // 生成纹理
      graphics.generateTexture(`run_${i}`, 50, 70);
      graphics.destroy();
    }
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x404040, 1);
    ground.fillRect(0, 500, 800, 100);

    // 创建角色精灵
    this.player = this.add.sprite(400, 450, 'idle_0');
    this.player.setOrigin(0.5, 1);

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

    // 播放初始 idle 动画
    this.player.play('idle');

    // 创建状态文本显示
    this.stateText = this.add.text(400, 50, 'State: IDLE', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.stateText.setOrigin(0.5);

    // 创建提示文本
    this.instructionText = this.add.text(400, 100, 'Press I for IDLE | Press R for RUN', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    this.instructionText.setOrigin(0.5);

    // 创建状态切换计数文本
    this.countText = this.add.text(400, 550, 'State Changes: 0', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    this.countText.setOrigin(0.5);

    // 监听键盘输入
    this.input.keyboard.on('keydown-I', () => {
      this.switchState('idle');
    });

    this.input.keyboard.on('keydown-R', () => {
      this.switchState('run');
    });

    // 日志初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      state: this.currentState,
      timestamp: Date.now()
    }));
  }

  switchState(newState) {
    if (this.currentState === newState) {
      return; // 状态未改变
    }

    const oldState = this.currentState;
    this.currentState = newState;

    // 更新信号
    window.__signals__.state = newState;
    window.__signals__.stateChangeCount++;
    window.__signals__.timestamp = Date.now();

    // 更新文本显示
    this.stateText.setText(`State: ${newState.toUpperCase()}`);
    this.countText.setText(`State Changes: ${window.__signals__.stateChangeCount}`);

    // 停止当前动画和 tween
    this.player.stop();
    this.tweens.killTweensOf(this.player);

    if (newState === 'idle') {
      // 切换到 idle 状态
      this.player.play('idle');
      
      // 添加轻微的上下浮动 tween
      this.tweens.add({
        targets: this.player,
        y: 445,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 重置位置
      this.tweens.add({
        targets: this.player,
        x: 400,
        duration: 500,
        ease: 'Power2'
      });

    } else if (newState === 'run') {
      // 切换到 run 状态
      this.player.play('run');
      
      // 添加左右移动 tween
      this.tweens.add({
        targets: this.player,
        x: 200,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear'
      });

      // 添加轻微的上下跳跃效果
      this.tweens.add({
        targets: this.player,
        y: 440,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Quad.easeInOut'
      });
    }

    // 输出状态切换日志
    console.log(JSON.stringify({
      event: 'state_change',
      oldState: oldState,
      newState: newState,
      changeCount: window.__signals__.stateChangeCount,
      timestamp: window.__signals__.timestamp
    }));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  pixelArt: true
};

new Phaser.Game(config);