class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.currentState = 'idle'; // idle, walk, run
    this.currentSpeed = 0;
    this.stateChangeCount = 0; // 状态切换次数
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    this.createPlayerTexture();
  }

  create() {
    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'playerTex');
    this.player.setScale(2);

    // 初始化速度
    this.playerVelocity = { x: 0, y: 0 };

    // 状态配置
    this.states = {
      idle: { speed: 0, color: 0x888888, name: '静止' },
      walk: { speed: 80, color: 0x00ff00, name: '行走' },
      run: { speed: 160, color: 0xff0000, name: '跑步' }
    };

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(20, 70, '按键: 1=静止 2=行走 3=跑步\n方向键: 移动角色', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建统计文本（可验证状态）
    this.statsText = this.add.text(20, 550, '', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入 - 状态切换
    this.input.keyboard.on('keydown-ONE', () => this.changeState('idle'));
    this.input.keyboard.on('keydown-TWO', () => this.changeState('walk'));
    this.input.keyboard.on('keydown-THREE', () => this.changeState('run'));

    // 方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化为静止状态
    this.changeState('idle');
  }

  update(time, delta) {
    // 重置速度
    this.playerVelocity.x = 0;
    this.playerVelocity.y = 0;

    // 根据方向键和当前状态计算速度
    if (this.currentSpeed > 0) {
      if (this.cursors.left.isDown) {
        this.playerVelocity.x = -this.currentSpeed;
      } else if (this.cursors.right.isDown) {
        this.playerVelocity.x = this.currentSpeed;
      }

      if (this.cursors.up.isDown) {
        this.playerVelocity.y = -this.currentSpeed;
      } else if (this.cursors.down.isDown) {
        this.playerVelocity.y = this.currentSpeed;
      }

      // 对角线移动时归一化速度
      if (this.playerVelocity.x !== 0 && this.playerVelocity.y !== 0) {
        const factor = Math.sqrt(2) / 2;
        this.playerVelocity.x *= factor;
        this.playerVelocity.y *= factor;
      }
    }

    // 应用速度移动角色
    const deltaSeconds = delta / 1000;
    this.player.x += this.playerVelocity.x * deltaSeconds;
    this.player.y += this.playerVelocity.y * deltaSeconds;

    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 32, 768);
    this.player.y = Phaser.Math.Clamp(this.player.y, 32, 568);

    // 更新统计信息
    const isMoving = this.playerVelocity.x !== 0 || this.playerVelocity.y !== 0;
    this.statsText.setText(
      `状态切换次数: ${this.stateChangeCount}\n` +
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `${isMoving ? '移动中' : '静止中'}`
    );
  }

  changeState(newState) {
    if (this.currentState === newState) return;

    this.currentState = newState;
    this.stateChangeCount++;

    const stateConfig = this.states[newState];
    this.currentSpeed = stateConfig.speed;

    // 更新角色颜色
    this.player.setTint(stateConfig.color);

    // 更新状态文本
    this.stateText.setText(
      `当前状态: ${stateConfig.name}\n` +
      `速度: ${stateConfig.speed} px/s`
    );

    console.log(`State changed to: ${newState}, speed: ${this.currentSpeed}`);
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    
    // 绘制一个简单的角色形状（身体+头部）
    // 身体
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(8, 12, 16, 20);
    
    // 头部
    graphics.fillStyle(0xffcc99, 1);
    graphics.fillCircle(16, 8, 8);
    
    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(13, 7, 2);
    graphics.fillCircle(19, 7, 2);

    // 生成纹理
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);