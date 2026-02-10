class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.currentState = 'idle'; // idle, walk, run
    this.currentSpeed = 0;
    this.stateHistory = []; // 记录状态切换历史
  }

  preload() {
    // 创建角色纹理 - 使用Graphics绘制
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 绘制角色 - 蓝色矩形
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(0, 0, 40, 60);
    
    // 添加眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 20, 5);
    graphics.fillCircle(28, 20, 5);
    
    // 生成纹理
    graphics.generateTexture('player', 40, 60);
    graphics.destroy();
  }

  create() {
    // 创建角色
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5, 0.5);
    
    // 速度配置
    this.speeds = {
      idle: 0,
      walk: 200,
      run: 400
    };
    
    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建说明文本
    this.instructionText = this.add.text(20, 70, 
      '按键说明:\n1 - 静止 (速度: 0)\n2 - 行走 (速度: 200)\n3 - 跑步 (速度: 400)', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建调试信息文本
    this.debugText = this.add.text(20, 520, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 设置键盘输入
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    
    // 监听按键事件
    this.key1.on('down', () => this.changeState('idle'));
    this.key2.on('down', () => this.changeState('walk'));
    this.key3.on('down', () => this.changeState('run'));
    
    // 初始化状态
    this.changeState('idle');
    
    // 添加边界检测
    this.playerDirection = 1; // 1向右, -1向左
  }

  changeState(newState) {
    // 记录状态变化
    const timestamp = this.time.now;
    this.stateHistory.push({
      state: newState,
      time: timestamp
    });
    
    // 保留最近10条记录
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }
    
    this.currentState = newState;
    this.currentSpeed = this.speeds[newState];
    
    // 更新角色缩放表示不同状态
    switch(newState) {
      case 'idle':
        this.player.setScale(1);
        this.player.setTint(0x4a90e2); // 蓝色
        break;
      case 'walk':
        this.player.setScale(1.1);
        this.player.setTint(0x50c878); // 绿色
        break;
      case 'run':
        this.player.setScale(1.2);
        this.player.setTint(0xff6b6b); // 红色
        break;
    }
    
    // 更新状态文本
    this.updateStateText();
  }

  updateStateText() {
    const stateNames = {
      idle: '静止',
      walk: '行走',
      run: '跑步'
    };
    
    this.stateText.setText(
      `当前状态: ${stateNames[this.currentState]}\n` +
      `当前速度: ${this.currentSpeed}`
    );
  }

  update(time, delta) {
    // 根据当前速度移动角色
    if (this.currentSpeed > 0) {
      // 水平移动
      this.player.x += this.currentSpeed * (delta / 1000) * this.playerDirection;
      
      // 边界检测并反转方向
      if (this.player.x > 780) {
        this.player.x = 780;
        this.playerDirection = -1;
        this.player.setFlipX(true);
      } else if (this.player.x < 20) {
        this.player.x = 20;
        this.playerDirection = 1;
        this.player.setFlipX(false);
      }
    }
    
    // 更新调试信息
    this.debugText.setText(
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `方向: ${this.playerDirection > 0 ? '右' : '左'}\n` +
      `状态切换次数: ${this.stateHistory.length}`
    );
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
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentState: scene.currentState,
    currentSpeed: scene.currentSpeed,
    stateHistory: scene.stateHistory,
    playerPosition: {
      x: Math.round(scene.player.x),
      y: Math.round(scene.player.y)
    }
  };
};