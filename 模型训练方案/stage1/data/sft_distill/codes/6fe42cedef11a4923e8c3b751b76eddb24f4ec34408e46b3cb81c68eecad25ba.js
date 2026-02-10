class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleTypes = [];
  }

  preload() {
    // 定义10种不同颜色的粒子配置
    this.particleTypes = [
      { name: 'Red', color: 0xff0000, tint: 0xff0000 },
      { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
      { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
      { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
      { name: 'Purple', color: 0x8800ff, tint: 0x8800ff },
      { name: 'Pink', color: 0xff88ff, tint: 0xff88ff },
      { name: 'Lime', color: 0x88ff00, tint: 0x88ff00 }
    ];

    // 为每种颜色创建纹理
    this.particleTypes.forEach((type, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(type.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle${this.currentParticleIndex}`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 添加状态显示文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文本
    this.add.text(20, 560, 'Press W/A/S/D to switch particle types', {
      fontSize: '18px',
      color: '#cccccc'
    });

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键事件
    this.keyW.on('down', () => this.switchParticle(-1));
    this.keyA.on('down', () => this.switchParticle(-1));
    this.keyS.on('down', () => this.switchParticle(1));
    this.keyD.on('down', () => this.switchParticle(1));

    // 添加鼠标跟随效果
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });

    // 添加预览区域显示所有粒子类型
    this.createPreviewPanel();
  }

  switchParticle(direction) {
    // 切换粒子类型索引
    this.currentParticleIndex += direction;
    
    // 循环索引
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleTypes.length - 1;
    } else if (this.currentParticleIndex >= this.particleTypes.length) {
      this.currentParticleIndex = 0;
    }

    // 更新粒子发射器纹理
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);
    
    // 更新粒子发射器配置（可选：添加一些变化）
    const currentType = this.particleTypes[this.currentParticleIndex];
    this.emitter.setConfig({
      speed: { min: 100 + this.currentParticleIndex * 10, max: 200 + this.currentParticleIndex * 10 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8 + this.currentParticleIndex * 0.02, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500 + this.currentParticleIndex * 50,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 更新状态文本
    this.updateStatusText();
    
    // 更新预览面板高亮
    this.updatePreviewHighlight();
  }

  updateStatusText() {
    const currentType = this.particleTypes[this.currentParticleIndex];
    this.statusText.setText(
      `Current Particle: ${this.currentParticleIndex + 1}/10 - ${currentType.name}\n` +
      `Status: Active`
    );
  }

  createPreviewPanel() {
    // 创建预览面板背景
    const panelX = 650;
    const panelY = 20;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.7);
    panelBg.fillRoundedRect(panelX, panelY, 130, 420, 5);

    this.add.text(panelX + 15, panelY + 10, 'All Types:', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 创建每个粒子类型的预览
    this.previewItems = [];
    this.particleTypes.forEach((type, index) => {
      const itemY = panelY + 45 + index * 35;
      
      // 背景高亮框
      const highlight = this.add.graphics();
      highlight.lineStyle(2, type.color, 0);
      highlight.strokeRoundedRect(panelX + 8, itemY - 3, 114, 30, 3);
      this.previewItems.push(highlight);

      // 粒子预览圆点
      const dot = this.add.graphics();
      dot.fillStyle(type.color, 1);
      dot.fillCircle(panelX + 25, itemY + 12, 8);

      // 类型名称
      this.add.text(panelX + 40, itemY + 4, `${index + 1}. ${type.name}`, {
        fontSize: '14px',
        color: '#ffffff'
      });
    });

    // 初始高亮
    this.updatePreviewHighlight();
  }

  updatePreviewHighlight() {
    // 更新预览面板中的高亮显示
    this.previewItems.forEach((highlight, index) => {
      if (index === this.currentParticleIndex) {
        highlight.clear();
        highlight.lineStyle(2, this.particleTypes[index].color, 1);
        highlight.strokeRoundedRect(658, 62 + index * 35, 114, 30, 3);
      } else {
        highlight.clear();
        highlight.lineStyle(2, this.particleTypes[index].color, 0);
        highlight.strokeRoundedRect(658, 62 + index * 35, 114, 30, 3);
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：让粒子发射器自动旋转等
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);