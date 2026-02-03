class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.currentState = 'idle';  // idle, walk, run
    this.currentSpeed = 0;
    this.stateConfig = {
      idle: { speed: 0, color: 0x808080, label: '静止' },
      walk: { speed: 120, color: 0x00ff00, label: '行走' },
      run: { speed: 240, color: 0xff0000, label: '跑步' }
    };
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    this.createPlayerTextures();
  }

  create() {
    // 创建角色
    this.player = this.add.sprite(400, 300, 'player_idle');
    this.player.setScale(2);

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建速度显示文本
    this.speedText = this.add.text(20, 60, '', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(20, 550, '按键: 1=静止 | 2=行走 | 3=跑步 | 方向键=移动', {
      fontSize: '18px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建调试信息文本
    this.debugText = this.add.text(20, 100, '', {
      fontSize: '16px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 监听状态切换按键
    this.key1.on('down', () => this.changeState('idle'));
    this.key2.on('down', () => this.changeState('walk'));
    this.key3.on('down', () => this.changeState('run'));

    // 初始化状态
    this.changeState('idle');

    // 移动方向
    this.velocity = { x: 0, y: 0 };
  }

  update(time, delta) {
    // 重置速度
    this.velocity.x = 0;
    this.velocity.y = 0;

    // 根据方向键和当前状态计算移动
    if (this.currentSpeed > 0) {
      if (this.cursors.left.isDown) {
        this.velocity.x = -this.currentSpeed;
      } else if (this.cursors.right.isDown) {
        this.velocity.x = this.currentSpeed;
      }

      if (this.cursors.up.isDown) {
        this.velocity.y = -this.currentSpeed;
      } else if (this.cursors.down.isDown) {
        this.velocity.y = this.currentSpeed;
      }

      // 对角线移动时归一化速度
      if (this.velocity.x !== 0 && this.velocity.y !== 0) {
        const factor = Math.sqrt(2) / 2;
        this.velocity.x *= factor;
        this.velocity.y *= factor;
      }
    }

    // 应用移动
    this.player.x += this.velocity.x * (delta / 1000);
    this.player.y += this.velocity.y * (delta / 1000);

    // 限制在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 800);
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, 600);

    // 更新调试信息
    const isMoving = this.velocity.x !== 0 || this.velocity.y !== 0;
    this.debugText.setText(
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `实际速度: ${isMoving ? Math.round(Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2)) : 0} px/s\n` +
      `移动中: ${isMoving ? '是' : '否'}`
    );
  }

  changeState(newState) {
    if (!this.stateConfig[newState]) return;

    this.currentState = newState;
    this.currentSpeed = this.stateConfig[newState].speed;

    // 更新角色纹理
    this.player.setTexture(`player_${newState}`);

    // 更新状态文本
    const config = this.stateConfig[newState];
    this.stateText.setText(`状态: ${config.label}`);
    this.stateText.setColor(this.getColorString(config.color));

    // 更新速度文本
    this.speedText.setText(`速度: ${this.currentSpeed} px/s`);

    // 输出到控制台供验证
    console.log(`State changed to: ${newState}, Speed: ${this.currentSpeed}`);
  }

  createPlayerTextures() {
    // 创建三种状态的纹理
    const states = ['idle', 'walk', 'run'];
    const colors = [0x808080, 0x00ff00, 0xff0000];
    const sizes = [32, 32, 32];

    states.forEach((state, index) => {
      const graphics = this.add.graphics();
      
      // 绘制角色身体（圆形）
      graphics.fillStyle(colors[index], 1);
      graphics.fillCircle(16, 16, 12);
      
      // 绘制眼睛
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(12, 12, 3);
      graphics.fillCircle(20, 12, 3);
      
      // 绘制瞳孔
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(12, 12, 1.5);
      graphics.fillCircle(20, 12, 1.5);
      
      // 根据状态绘制不同特征
      if (state === 'walk') {
        // 行走状态：小脚印
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(10, 26, 4, 2);
        graphics.fillRect(18, 26, 4, 2);
      } else if (state === 'run') {
        // 跑步状态：速度线
        graphics.lineStyle(2, 0xffff00, 1);
        graphics.lineBetween(0, 16, 8, 16);
        graphics.lineBetween(0, 12, 6, 12);
        graphics.lineBetween(0, 20, 6, 20);
      }
      
      // 生成纹理
      graphics.generateTexture(`player_${state}`, sizes[index], sizes[index]);
      graphics.destroy();
    });
  }

  getColorString(hexColor) {
    return '#' + hexColor.toString(16).padStart(6, '0');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露状态供外部验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentState: scene.currentState,
    currentSpeed: scene.currentSpeed,
    playerPosition: {
      x: Math.round(scene.player.x),
      y: Math.round(scene.player.y)
    }
  };
};