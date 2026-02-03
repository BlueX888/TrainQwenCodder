class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.playerState = 'idle'; // idle, walk, run
    this.playerSpeed = 0;
    this.playerVelocityX = 0;
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 创建一个简单的角色形状（蓝色方块）
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(0, 0, 40, 60);
    
    // 添加眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 20, 5);
    graphics.fillCircle(28, 20, 5);
    
    // 添加瞳孔
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(12, 20, 2);
    graphics.fillCircle(28, 20, 2);
    
    graphics.generateTexture('player', 40, 60);
    graphics.destroy();
  }

  create() {
    // 创建角色
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5, 0.5);

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.instructionText = this.add.text(20, 70, 
      '按键控制：\n1 - 静止 (速度: 0)\n2 - 行走 (速度: 80)\n3 - 跑步 (速度: 160)\n← → 方向键移动', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听按键事件
    this.key1.on('down', () => this.changeState('idle'));
    this.key2.on('down', () => this.changeState('walk'));
    this.key3.on('down', () => this.changeState('run'));

    // 初始化状态
    this.changeState('idle');

    // 添加状态指示器（可视化当前状态）
    this.stateIndicator = this.add.graphics();
    this.updateStateIndicator();
  }

  changeState(newState) {
    this.playerState = newState;
    
    // 根据状态设置速度
    switch(newState) {
      case 'idle':
        this.playerSpeed = 0;
        break;
      case 'walk':
        this.playerSpeed = 80;
        break;
      case 'run':
        this.playerSpeed = 160;
        break;
    }

    // 更新状态显示
    this.updateStateText();
    this.updateStateIndicator();
  }

  updateStateText() {
    const stateNames = {
      'idle': '静止',
      'walk': '行走',
      'run': '跑步'
    };
    
    this.stateText.setText(
      `状态: ${stateNames[this.playerState]} | 速度: ${this.playerSpeed}`
    );
  }

  updateStateIndicator() {
    // 清除之前的指示器
    this.stateIndicator.clear();
    
    // 根据状态绘制不同颜色的圆圈
    const colors = {
      'idle': 0xff0000,   // 红色 - 静止
      'walk': 0xffff00,   // 黄色 - 行走
      'run': 0x00ff00     // 绿色 - 跑步
    };
    
    this.stateIndicator.fillStyle(colors[this.playerState], 1);
    this.stateIndicator.fillCircle(20, 180, 15);
    
    // 添加指示器标签
    if (!this.indicatorLabel) {
      this.indicatorLabel = this.add.text(45, 165, '状态指示器', {
        fontSize: '14px',
        fill: '#ffffff'
      });
    }
  }

  update(time, delta) {
    // 重置速度
    this.playerVelocityX = 0;

    // 处理方向键输入（只在非静止状态下移动）
    if (this.playerSpeed > 0) {
      if (this.cursors.left.isDown) {
        this.playerVelocityX = -this.playerSpeed;
        this.player.setFlipX(true); // 面向左
      } else if (this.cursors.right.isDown) {
        this.playerVelocityX = this.playerSpeed;
        this.player.setFlipX(false); // 面向右
      }
    }

    // 应用速度（delta 转换为秒）
    const deltaSeconds = delta / 1000;
    this.player.x += this.playerVelocityX * deltaSeconds;

    // 边界检测
    const halfWidth = this.player.width / 2;
    if (this.player.x < halfWidth) {
      this.player.x = halfWidth;
    } else if (this.player.x > 800 - halfWidth) {
      this.player.x = 800 - halfWidth;
    }

    // 添加简单的动画效果（根据状态改变角色的上下浮动）
    if (this.playerState === 'walk') {
      this.player.y = 300 + Math.sin(time / 200) * 5;
    } else if (this.playerState === 'run') {
      this.player.y = 300 + Math.sin(time / 100) * 8;
    } else {
      this.player.y = 300;
    }
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